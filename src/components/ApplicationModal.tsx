import { type FormEvent, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { addApplication } from '../services/applicationService';
import {
  COURSE_TITLES,
  type CourseTitle,
  VALIDATION_RULES,
} from '../types/application';

interface ApplicationModalProps {
  isOpen: boolean;
  initialCourse?: CourseTitle | '';
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  motivation?: string;
}

function formatKoreanPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function ApplicationModal({
  isOpen,
  initialCourse = '',
  onClose,
}: ApplicationModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState<CourseTitle | ''>(initialCourse);
  const [motivation, setMotivation] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCourse(initialCourse || COURSE_TITLES[0]);
      setErrors({});
      setSubmitError('');
      setIsSuccess(false);
      const timer = window.setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, initialCourse]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCourse(COURSE_TITLES[0]);
    setMotivation('');
    setErrors({});
    setSubmitError('');
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedMotivation = motivation.trim();

    if (!trimmedName) {
      nextErrors.name = '이름을 입력해 주세요.';
    } else if (
      trimmedName.length < VALIDATION_RULES.NAME_MIN ||
      trimmedName.length > VALIDATION_RULES.NAME_MAX
    ) {
      nextErrors.name = `이름은 ${VALIDATION_RULES.NAME_MIN}자 이상 ${VALIDATION_RULES.NAME_MAX}자 이하로 입력해 주세요.`;
    }

    if (!trimmedEmail) {
      nextErrors.email = '이메일을 입력해 주세요.';
    } else if (
      trimmedEmail.length > VALIDATION_RULES.EMAIL_MAX ||
      !VALIDATION_RULES.EMAIL_REGEX.test(trimmedEmail)
    ) {
      nextErrors.email = '올바른 이메일 형식(예: name@company.com)을 입력해 주세요.';
    }

    if (!trimmedPhone) {
      nextErrors.phone = '휴대폰 번호를 입력해 주세요.';
    } else if (!VALIDATION_RULES.PHONE_REGEX.test(trimmedPhone)) {
      nextErrors.phone = '올바른 휴대폰 번호 형식(예: 010-1234-5678)을 입력해 주세요.';
    }

    if (!course || !COURSE_TITLES.includes(course)) {
      nextErrors.course = '신청하실 강의를 선택해 주세요.';
    }

    if (!trimmedMotivation) {
      nextErrors.motivation = '신청 동기를 입력해 주세요.';
    } else if (trimmedMotivation.length < VALIDATION_RULES.MOTIVATION_MIN) {
      nextErrors.motivation = `신청 동기는 최소 ${VALIDATION_RULES.MOTIVATION_MIN}자 이상 작성해 주세요.`;
    } else if (trimmedMotivation.length > VALIDATION_RULES.MOTIVATION_MAX) {
      nextErrors.motivation = `신청 동기는 최대 ${VALIDATION_RULES.MOTIVATION_MAX}자까지 입력할 수 있습니다.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;

    setSubmitError('');
    if (!validate() || !course) return;

    setIsSubmitting(true);
    try {
      await addApplication({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        course,
        motivation: motivation.trim(),
      });

      setIsSuccess(true);
      resetForm();
      window.setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : '신청 처리 중 오류가 발생했습니다.';
      if (msg.includes('Quota exceeded')) {
        setSubmitError('일시적으로 신청 접수가 많습니다. 잠시 후 다시 시도해 주세요.');
      } else if (msg.includes('Missing or insufficient permissions')) {
        setSubmitError('입력하신 정보의 형식이 보안 정책과 맞지 않습니다. 항목을 다시 확인해 주세요.');
      } else {
        setSubmitError('수강신청 저장에 실패했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    setIsSuccess(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div>
            <h2
              id="application-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              AI 강의 수강신청
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              모든 필수 항목을 입력하시면 담당자가 검토 후 안내드립니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="수강신청 팝업 닫기"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">
                  수강신청이 완료되었습니다
                </h3>
                <p className="text-sm text-slate-600">
                  입력하신 연락처로 교육 과정 안내 및 등록 절차를 안내해 드리겠습니다.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {submitError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="applicant-name"
                  className="block text-sm font-medium text-slate-800 mb-1.5"
                >
                  이름 <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="applicant-name"
                  type="text"
                  required
                  maxLength={VALIDATION_RULES.NAME_MAX}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="홍길동"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'error-name' : undefined}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
                />
                {errors.name && (
                  <p id="error-name" className="mt-1.5 text-xs text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="applicant-email"
                  className="block text-sm font-medium text-slate-800 mb-1.5"
                >
                  이메일 <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <input
                  id="applicant-email"
                  type="email"
                  required
                  maxLength={VALIDATION_RULES.EMAIL_MAX}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="example@company.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'error-email' : undefined}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
                />
                {errors.email && (
                  <p id="error-email" className="mt-1.5 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="applicant-phone"
                  className="block text-sm font-medium text-slate-800 mb-1.5"
                >
                  휴대폰 번호 <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <input
                  id="applicant-phone"
                  type="tel"
                  required
                  maxLength={VALIDATION_RULES.PHONE_MAX}
                  value={phone}
                  onChange={(e) => {
                    setPhone(formatKoreanPhone(e.target.value));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="010-1234-5678"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'error-phone' : undefined}
                  className="w-full px-3.5 py-2.5 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
                />
                {errors.phone && (
                  <p id="error-phone" className="mt-1.5 text-xs text-red-600">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="applicant-course"
                  className="block text-sm font-medium text-slate-800 mb-1.5"
                >
                  신청 강의 <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <select
                  id="applicant-course"
                  required
                  value={course}
                  onChange={(e) => {
                    setCourse(e.target.value as CourseTitle);
                    if (errors.course) setErrors((prev) => ({ ...prev, course: undefined }));
                  }}
                  aria-invalid={Boolean(errors.course)}
                  aria-describedby={errors.course ? 'error-course' : undefined}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
                >
                  {COURSE_TITLES.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
                {errors.course && (
                  <p id="error-course" className="mt-1.5 text-xs text-red-600">
                    {errors.course}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="applicant-motivation"
                    className="block text-sm font-medium text-slate-800"
                  >
                    신청 동기 <span className="text-red-600" aria-hidden="true">*</span>
                  </label>
                  <span className="text-xs font-mono-tabular text-slate-400">
                    {motivation.trim().length} / {VALIDATION_RULES.MOTIVATION_MAX}
                  </span>
                </div>
                <textarea
                  id="applicant-motivation"
                  rows={4}
                  required
                  maxLength={VALIDATION_RULES.MOTIVATION_MAX}
                  value={motivation}
                  onChange={(e) => {
                    setMotivation(e.target.value);
                    if (errors.motivation) {
                      setErrors((prev) => ({ ...prev, motivation: undefined }));
                    }
                  }}
                  placeholder="수강을 희망하는 이유와 업무 또는 학습 목표를 작성해 주세요."
                  aria-invalid={Boolean(errors.motivation)}
                  aria-describedby={errors.motivation ? 'error-motivation' : undefined}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15 resize-y"
                />
                {errors.motivation && (
                  <p id="error-motivation" className="mt-1.5 text-xs text-red-600">
                    {errors.motivation}
                  </p>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed min-w-[132px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>접수 중...</span>
                    </>
                  ) : (
                    <span>신청 완료하기</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
