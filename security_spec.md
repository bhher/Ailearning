# Firestore Security Specification (AI LEARNING)

## 1. Data Invariants
1. **Public Write-Only Enrollment**: Anyone (including unauthenticated visitors) may create a document in `/applications/{applicationId}`, provided all 7 required fields exist, no shadow/extra fields exist, `status` is strictly `'신청접수'`, and `createdAt == request.time`.
2. **Strict PII Isolation**: No unauthenticated user or non-admin authenticated user may `get` or `list` `/applications/{applicationId}` (contains PII: `name`, `email`, `phone`, `motivation`).
3. **Admin-Only Read, Update & Delete**: Only verified administrators (`isAdmin()`) may read, list, update status (`['신청접수', '검토중', '승인완료', '취소']`), or delete documents in `/applications`.
4. **Immutable Audit Fields**: `createdAt`, `name`, `email`, `phone`, `course`, `motivation` cannot be modified during status updates (`affectedKeys().hasOnly(['status', 'updatedAt'])`).
5. **Path Hardening**: All document IDs (`applicationId`, `adminId`) must match `^[a-zA-Z0-9_-]+$` and have length `<= 128`.
6. **Verified Identity**: Admin checks require `request.auth != null && request.auth.token.email_verified == true`.

## 2. The "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated List Read**: Unauthenticated client runs `getDocs(collection(db, 'applications'))` -> Denied (PII leak prevention).
2. **Non-Admin Authenticated Get**: Signed-in non-admin user (`other@example.com`) runs `getDoc(doc(db, 'applications', 'app1'))` -> Denied.
3. **Unverified Admin Email Spoof**: Signed-in user with `email: 'bhher30@gmail.com'` but `email_verified: false` -> Denied.
4. **Shadow Field Injection on Create**: Create application with extra field `{ ..., isAdminApproved: true }` -> Denied by `hasOnly`.
5. **State Shortcutting on Create**: Create application with `status: '승인완료'` instead of `'신청접수'` -> Denied.
6. **Timestamp Forgery on Create**: Create application with client-provided `createdAt: new Date('2020-01-01')` instead of `serverTimestamp()` -> Denied (`createdAt == request.time`).
7. **Invalid Course Injection**: Create application with `course: '해킹 과정'` -> Denied (not in course allowlist).
8. **Oversized Payload (Denial of Wallet)**: Create application with 5,000-character `motivation` -> Denied (`size() <= 1000`).
9. **Path Variable Poisoning**: Create application at `/applications/bad$id` -> Denied by `isValidId`.
10. **Non-Admin Status Update**: Non-admin authenticated user attempts `updateDoc` to change `status` -> Denied.
11. **Admin Immutable Field Tampering**: Admin attempts to modify `createdAt` or `email` during update -> Denied by `affectedKeys().hasOnly(['status', 'updatedAt'])` and `incoming().createdAt == existing().createdAt`.
12. **Self-Assigned Admin Escalation**: Non-admin user attempts `setDoc(doc(db, 'admins', myUid), { role: 'admin', ... })` -> Denied.
