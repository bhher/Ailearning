interface FooterProps {
  onOpenApplication: () => void;
}

export default function Footer({ onOpenApplication }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          <div className="md:col-span-5 space-y-4">
            <p className="font-display text-lg font-extrabold tracking-tight text-white">
              AI LEARNING
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              AI LEARNING은 생성형 AI 활용부터 Python 기반 모델링, 업무 자동화, 엔터프라이즈 백엔드
              연동까지 현업에서 바로 적용할 수 있는 실무 중심 인공지능 교육기관입니다.
            </p>
            <button
              type="button"
              onClick={onOpenApplication}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-slate-950 bg-white rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              수강 신청하기
            </button>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h2 className="text-sm font-semibold text-white">교육 안내</h2>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  홈
                </a>
              </li>
              <li>
                <a href="#courses" className="hover:text-white transition-colors">
                  강의 소개
                </a>
              </li>
              <li>
                <a href="#curriculum" className="hover:text-white transition-colors">
                  교육 과정 특징
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  교육 문의
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">기관 정보</h2>
            <dl className="space-y-2 text-sm text-slate-400">
              <div className="flex gap-3">
                <dt className="text-slate-500 shrink-0 w-14">연락처</dt>
                <dd className="font-mono-tabular text-slate-300">02-6204-8100</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-slate-500 shrink-0 w-14">이메일</dt>
                <dd className="text-slate-300">admissions@ailearning.kr</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-slate-500 shrink-0 w-14">주소</dt>
                <dd className="text-slate-300">
                  서울특별시 강남구 테헤란로 212, AI 캠퍼스 6층
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-slate-500 shrink-0 w-14">운영시간</dt>
                <dd className="text-slate-300">평일 09:30 – 18:30 (공휴일 휴무)</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AI LEARNING. All rights reserved.</p>
          <p>사업자등록번호 214-88-90421 · 평생직업교육학원 등록 제2026-서울강남-0412호</p>
        </div>
      </div>
    </footer>
  );
}
