import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  type ApplicationInput,
  type ApplicationRecord,
  ApplicationStatus,
  COURSE_TITLES,
  type CourseTitle,
  VALIDATION_RULES,
} from '../types/application';

const APPLICATIONS_COLLECTION = 'applications';
const BOOTSTRAPPED_ADMIN_EMAIL = 'bhher30@gmail.com';

function sanitizeApplicationInput(input: ApplicationInput): ApplicationInput {
  const name = input.name.trim().slice(0, VALIDATION_RULES.NAME_MAX);
  const email = input.email.trim().toLowerCase().slice(0, VALIDATION_RULES.EMAIL_MAX);
  const phone = input.phone.trim().slice(0, VALIDATION_RULES.PHONE_MAX);
  const motivation = input.motivation.trim().slice(0, VALIDATION_RULES.MOTIVATION_MAX);

  if (name.length < VALIDATION_RULES.NAME_MIN) {
    throw new Error('이름은 최소 2자 이상 입력해 주세요.');
  }
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    throw new Error('올바른 이메일 주소를 입력해 주세요.');
  }
  if (!VALIDATION_RULES.PHONE_REGEX.test(phone)) {
    throw new Error('올바른 휴대폰 번호 형식(예: 010-1234-5678)을 입력해 주세요.');
  }
  if (!COURSE_TITLES.includes(input.course)) {
    throw new Error('유효한 강의를 선택해 주세요.');
  }
  if (motivation.length < VALIDATION_RULES.MOTIVATION_MIN) {
    throw new Error('신청 동기는 최소 5자 이상 입력해 주세요.');
  }

  return {
    name,
    email,
    phone,
    course: input.course,
    motivation,
  };
}

export async function addApplication(input: ApplicationInput): Promise<string> {
  const sanitized = sanitizeApplicationInput(input);

  try {
    const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...sanitized,
      status: ApplicationStatus.RECEIVED,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, APPLICATIONS_COLLECTION);
  }
}

export async function getApplications(): Promise<ApplicationRecord[]> {
  try {
    const q = query(collection(db, APPLICATIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        name: String(data.name ?? ''),
        email: String(data.email ?? ''),
        phone: String(data.phone ?? ''),
        course: data.course as CourseTitle,
        motivation: String(data.motivation ?? ''),
        status: (data.status as ApplicationStatus) ?? ApplicationStatus.RECEIVED,
        createdAt: data.createdAt ?? null,
        updatedAt: data.updatedAt ?? null,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, APPLICATIONS_COLLECTION);
  }
}

export function subscribeApplications(
  onData: (applications: ApplicationRecord[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, APPLICATIONS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const records: ApplicationRecord[] = snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          name: String(data.name ?? ''),
          email: String(data.email ?? ''),
          phone: String(data.phone ?? ''),
          course: data.course as CourseTitle,
          motivation: String(data.motivation ?? ''),
          status: (data.status as ApplicationStatus) ?? ApplicationStatus.RECEIVED,
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null,
        };
      });
      onData(records);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, APPLICATIONS_COLLECTION);
      } catch (wrappedError) {
        onError(
          wrappedError instanceof Error
            ? wrappedError
            : new Error('수강신청 목록을 불러오는 중 오류가 발생했습니다.')
        );
      }
    }
  );
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<void> {
  const path = `${APPLICATIONS_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteApplication(id: string): Promise<void> {
  const path = `${APPLICATIONS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, APPLICATIONS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function checkAdminAccess(
  uid: string,
  email?: string | null,
  emailVerified?: boolean
): Promise<boolean> {
  if (!emailVerified) {
    return false;
  }
  if (email === BOOTSTRAPPED_ADMIN_EMAIL) {
    return true;
  }
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists() && adminDoc.data()?.role === 'admin';
  } catch {
    return false;
  }
}
