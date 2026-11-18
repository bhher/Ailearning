import { useState } from 'react';
import { signInWithPopup, signOut, type User } from 'firebase/auth';
import { AlertCircle, ArrowLeft, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { auth, googleProvider } from '../firebase';

interface AdminLoginProps {
  currentUser: User | null;
  isAdmin: boolean;
  checkingRole: boolean;
  onBackHome: () => void;
}

export default function AdminLogin({
  currentUser,
  isAdmin,
  checkingRole,
  onBackHome,
}: AdminLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const code = (error as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMessage('로그인 창이 닫혔습니다. 다시 시도해 주세요.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('브라우저에서 팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.');
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMessage(
          '현재 도메인이 Firebase Authentication 승인 도메인에 등록되어 있지 않습니다.'
        );
      } else {
        setErrorMessage('관리자 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setErrorMessage('');
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6">
      <div className="max-w-md w-full mx-auto pt-4">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>메인 페이지로 돌아가기</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto my-auto bg-white border border-slate-200 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-sm font-extrabold tracking-tight text-slate-900">
              AI LEARNING
            </p>
            <h1 className="text-lg font-bold text-slate-900">관리자 로그인</h1>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          수강신청 내역 조회, 상태 변경 및 데이터 관리는 인증된 관리자 계정으로만 접근할 수
          있습니다.
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {checkingRole ? (
          <div className="py-6 flex items-center justify-center gap-2.5 text-sm text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin text-blue-700" aria-hidden="true" />
            <span>관리자 권한을 확인하고 있습니다...</span>
          </div>
        ) : currentUser && !isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900 space-y-1">
              <p className="font-semibold">접근 권한이 없는 계정입니다</p>
              <p className="text-xs text-amber-800">
                현재 로그인된 계정(<span className="font-mono">{currentUser.email}</span>)은 관리자
                권한이 등록되어 있지 않습니다.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60"
              >
                <span>다른 Google 계정으로 로그인</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>로그인 진행 중...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"
                  />
                </svg>
                <span>Google 계정으로 관리자 로그인</span>
              </>
            )}
          </button>
        )}

        <p className="mt-6 text-xs text-slate-400 text-center">
          Firebase Authentication 및 Firestore Security Rules로 보호됩니다.
        </p>
      </div>

      <p className="text-center text-xs text-slate-400">© 2026 AI LEARNING Admin Console</p>
    </div>
  );
}
