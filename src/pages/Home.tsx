import { useMemo, useState } from 'react';
import { ArrowRight, Building2, Mail, MapPin, Phone } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { COURSES, type CourseTitle } from '../types/application';

interface HomeProps {
  onOpenApplicationModal: (course?: CourseTitle) => void;
  onOpenAdmin: () => void;
}

type TrackFilter = 'all' | 'practical' | 'engineering';

const CURRICULUM_FEATURES = [
  {
    number: '01',
    title: '초보자도 쉽게 시작하는 AI 교육',
    description:
      '비전공자와 입문자도 생성형 AI의 핵심 원리부터 실무 프롬프트 설계까지 단계별 가이드를 따라 무리 없이 학습할 수 있습니다.',
  },
  {
    number: '02',
    title: '실습 중심 교육',
    description:
      '일방적인 개념 설명을 줄이고 전체 수업의 75% 이상을 실제 도구, API, 코드 작성으로 채워 손에 익는 실전 감각을 기릅니다.',
  },
  {
    number: '03',
    title: '프로젝트 기반 학습',
    description:
      '수강생 각자의 직무와 도메인에 맞춘 미니 프로젝트를 기획·구현하고 현업 멘토의 코드·산출물 피드백을 거쳐 완성합니다.',
  },
  {
    number: '04',
    title: '현업 활용 가능한 AI 기술',
    description:
      'ChatGPT 실무 워크플로부터 n8n·Make 자동화, Python 추론 서버, Spring AI 백엔드 연동까지 기업 현장에서 검증된 기술만 다룹니다.',
  },
];

export default function Home({ onOpenApplicationModal, onOpenAdmin }: HomeProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');

  const filteredCourses = useMemo(() => {
    if (trackFilter === 'practical') {
      return COURSES.filter((c) => c.id === 'genai' || c.id === 'chatgpt-work');
    }
    if (trackFilter === 'engineering') {
      return COURSES.filter(
        (c) => c.id === 'python-ai' || c.id === 'ai-automation' || c.id === 'springboot-ai'
      );
    }
    return COURSES;
  }, [trackFilter]);

  return (
    <div id="home" className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenAdmin={onOpenAdmin}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 lg:pt-16 lg:pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center">
                <p className="text-xs sm:text-sm font-medium text-blue-700 mb-4">
                  AI LEARNING 정규 실무 아카데미 · 2026 수강생 모집
                </p>

                <h1
                  className="font-display font-extrabold text-slate-950 tracking-tight leading-[1.15] mb-5"
                  style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
                >
                  AI로 시작하는 새로운 가능성
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-8">
                  생성형 AI부터 실무 자동화까지, 미래를 준비하는 AI 실무 교육.
                  입문자부터 백엔드 개발자까지 직무에 바로 적용하는 5개 정규 트랙을 만나보세요.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onOpenApplicationModal()}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm sm:text-base font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <span>수강 신청하기</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <a
                    href="#courses"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-950 transition-colors whitespace-nowrap shrink-0"
                  >
                    전체 강의 보기
                  </a>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="w-full h-full min-h-[280px] lg:min-h-[400px] rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                  {!heroImgFailed ? (
                    <img
                      src="/src/assets/images/hero_ai_academy_1794901821761.jpg"
                      alt="AI LEARNING 강의실 및 실무 프로젝트 협업 스튜디오"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[320px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-end p-8 text-white">
                      <p className="text-sm font-medium text-blue-300 mb-2">AI LEARNING CAMPUS</p>
                      <p className="text-xl font-bold">실무 중심 인공지능 교육 스튜디오</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full-Width 4-Column Institutional Summary Strip */}
            <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div>
                <p className="text-xs text-slate-500 mb-1">개설 정규 커리큘럼</p>
                <p className="font-mono-tabular text-2xl font-bold text-slate-900">5개 과정</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">핸즈온 실습 비중</p>
                <p className="font-mono-tabular text-2xl font-bold text-slate-900">75% 이상</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">수료 산출물</p>
                <p className="font-mono-tabular text-2xl font-bold text-slate-900">1인 1프로젝트</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">신청 검토 안내</p>
                <p className="font-mono-tabular text-2xl font-bold text-slate-900">영업일 24시간 내</p>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section id="courses" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold text-blue-700 mb-2">강의 소개</p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                  직무와 목적에 맞는 5가지 AI 실무 교육 과정
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  모든 과정은 최신 모델 환경과 실무 과제를 기반으로 구성되어 있으며, 원하는 강의를
                  선택해 즉시 수강을 신청할 수 있습니다.
                </p>
              </div>

              {/* Interactive Filter Tabs */}
              <div
                role="group"
                aria-label="강의 트랙 필터"
                className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start md:self-auto"
              >
                <button
                  type="button"
                  onClick={() => setTrackFilter('all')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    trackFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  전체 과정 (5)
                </button>
                <button
                  type="button"
                  onClick={() => setTrackFilter('practical')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    trackFilter === 'practical'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  활용 · 기획 (2)
                </button>
                <button
                  type="button"
                  onClick={() => setTrackFilter('engineering')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    trackFilter === 'engineering'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  개발 · 자동화 (3)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCourses.map((course, idx) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  spanWide={trackFilter === 'all' && idx === 0}
                  onSelectCourse={(title) => onOpenApplicationModal(title)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Curriculum Features Section */}
        <section id="curriculum" className="py-16 lg:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 lg:sticky lg:top-24">
                <p className="text-xs font-semibold text-blue-700 mb-2">교육 과정 특징</p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug mb-4">
                  이론을 넘어 현업 문제를 해결하는 교육 방식
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                  AI LEARNING은 단기 유행 도구를 소개하는 데 그치지 않고, 수강생이 업무와
                  서비스 환경에 맞게 AI를 설계·운영할 수 있는 기초 체력을 함께 구축합니다.
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm font-semibold text-slate-900 mb-1.5">
                    소수 정예 오프라인 · 실시간 코칭
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    모든 기수는 기수별 정원제로 운영되어 강사진의 1:1 실습 피드백과 코드 리뷰가
                    제공됩니다.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 divide-y divide-slate-200 border-t border-b border-slate-200">
                {CURRICULUM_FEATURES.map((feature) => (
                  <div key={feature.number} className="py-7 sm:py-8 flex items-start gap-6">
                    <span className="font-mono-tabular text-sm font-semibold text-blue-700 pt-1 shrink-0">
                      {feature.number}.
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Enrollment CTA Section */}
        <section id="contact" className="py-16 lg:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-4">
                <p className="text-xs font-semibold text-blue-300">교육 문의 및 수강 안내</p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                  맞춤 과정 상담이 필요하시다면 지금 신청해 주세요
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  수강신청서를 제출하시면 교육 매니저가 현재 직무와 학습 목표를 확인한 뒤 가장
                  적합한 기수 일정과 커리큘럼 안내를 드립니다.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenApplicationModal()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-950 bg-white rounded-lg hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>수강 신청하기</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-800/70 border border-slate-700 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">교육기관</p>
                    <p className="text-sm font-medium text-white">AI LEARNING 실무교육센터</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">입학 상담 전화</p>
                    <p className="text-sm font-mono-tabular font-medium text-white">02-6204-8100</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">이메일 문의</p>
                    <p className="text-sm font-medium text-white">admissions@ailearning.kr</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">캠퍼스 위치</p>
                    <p className="text-sm font-medium text-white">
                      서울특별시 강남구 테헤란로 212, AI 캠퍼스 6층
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onOpenApplication={() => onOpenApplicationModal()} />
    </div>
  );
}
