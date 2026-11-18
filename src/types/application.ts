import type { Timestamp } from 'firebase/firestore';

export enum ApplicationStatus {
  RECEIVED = '신청접수',
  REVIEWING = '검토중',
  APPROVED = '승인완료',
  CANCELLED = '취소',
}

export const APPLICATION_STATUS_LIST: ApplicationStatus[] = [
  ApplicationStatus.RECEIVED,
  ApplicationStatus.REVIEWING,
  ApplicationStatus.APPROVED,
  ApplicationStatus.CANCELLED,
];

export const COURSE_TITLES = [
  '생성형 AI 활용 과정',
  'Python 기반 AI 프로그래밍',
  'ChatGPT 실무 활용',
  'AI 자동화 및 업무 효율화',
  'Spring Boot AI 연동 실습',
] as const;

export type CourseTitle = (typeof COURSE_TITLES)[number];

export interface CourseInfo {
  id: string;
  number: string;
  title: CourseTitle;
  duration: string;
  level: string;
  format: string;
  summary: string;
  topics: string[];
  image?: string;
  featured?: boolean;
}

export const COURSES: CourseInfo[] = [
  {
    id: 'genai',
    number: '01',
    title: '생성형 AI 활용 과정',
    duration: '6주 과정',
    level: '입문 · 기획자 및 실무자',
    format: '오프라인 · 실시간 실습',
    summary:
      '텍스트·이미지·문서 생성 도구의 작동 원리를 이해하고 실무 산출물 제작 파이프라인을 구축합니다.',
    topics: [
      '멀티모달 생성형 AI 모델 구조와 모델별 강점 비교',
      '브랜드 톤앤매너를 유지하는 프롬프트 아키텍처 설계',
      '기획서·제안서·마케팅 시각 자료 제작 실전 워크플로',
    ],
    image: '/src/assets/images/course_genai_studio_1794901837018.jpg',
    featured: true,
  },
  {
    id: 'python-ai',
    number: '02',
    title: 'Python 기반 AI 프로그래밍',
    duration: '8주 과정',
    level: '기초 · 예비 개발자',
    format: '코드 실습 · 프로젝트 평가',
    summary:
      '데이터 전처리부터 머신러닝·딥러닝 모델 학습과 추론 API 서빙까지 Python으로 직접 구현합니다.',
    topics: [
      'NumPy · Pandas 기반 정형 데이터 전처리 및 피처 엔지니어링',
      'Scikit-learn · PyTorch를 활용한 예측 모델 학습과 성능 검증',
      'FastAPI 기반 AI 모델 추론 서버 구축 및 배포 실습',
    ],
    image: '/src/assets/images/course_python_code_1794901823253.jpg',
    featured: true,
  },
  {
    id: 'chatgpt-work',
    number: '03',
    title: 'ChatGPT 실무 활용',
    duration: '4주 과정',
    level: '입문 · 직무 공통',
    format: '워크숍 · 직무별 케이스',
    summary:
      '보고서 요약, 데이터 해석, 회의록 정제, 고객 응대 템플릿 등 일상 업무 생산성을 구조적으로 높입니다.',
    topics: [
      '직무별 Custom GPTs 설계 및 사내 표준 프롬프트 라이브러리 구축',
      '비정형 문서·엑셀 데이터 분석 및 인사이트 리포트 자동 도출',
      '할루시네이션 검증 기준과 기업 보안 가이드라인 적용법',
    ],
  },
  {
    id: 'ai-automation',
    number: '04',
    title: 'AI 자동화 및 업무 효율화',
    duration: '6주 과정',
    level: '중급 · 운영 및 PM',
    format: '실무 자동화 · 팀 프로젝트',
    summary:
      '노코드 자동화 도구와 LLM API를 연결하여 반복적인 데이터 수집·알림·문서 처리를 완전 자동화합니다.',
    topics: [
      'Webhook · Make · n8n 기반 다중 앱 업무 파이프라인 설계',
      '이메일·슬랙·스프레드시트 연동 자동 분류 및 요약 봇 구현',
      'RAG(검색 증강 생성) 기반 사내 매뉴얼 질의응답 시스템 구축',
    ],
    image: '/src/assets/images/course_automation_flow_1794901823689.jpg',
  },
  {
    id: 'springboot-ai',
    number: '05',
    title: 'Spring Boot AI 연동 실습',
    duration: '8주 과정',
    level: '심화 · 백엔드 개발자',
    format: '엔터프라이즈 백엔드 실습',
    summary:
      'Spring AI와 자바 엔터프라이즈 아키텍처 위에서 안정적인 LLM 서비스와 벡터 검색 백엔드를 개발합니다.',
    topics: [
      'Spring AI 기반 ChatClient, PromptTemplate 및 스트리밍 SSE 응답 구현',
      'Pgvector 연동 문서 임베딩 저장 및 RAG 검색 파이프라인 설계',
      'Function Calling · 비동기 처리 · 토큰 비용 제어 프로덕션 패턴',
    ],
  },
];

// Validation boundaries synchronized verbatim with firebase-blueprint.json and firestore.rules
export const VALIDATION_RULES = {
  NAME_MIN: 2,
  NAME_MAX: 50,
  EMAIL_MIN: 5,
  EMAIL_MAX: 120,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_MIN: 9,
  PHONE_MAX: 20,
  PHONE_REGEX: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
  MOTIVATION_MIN: 5,
  MOTIVATION_MAX: 1000,
} as const;

export interface ApplicationInput {
  name: string;
  email: string;
  phone: string;
  course: CourseTitle;
  motivation: string;
}

export interface ApplicationRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: CourseTitle;
  motivation: string;
  status: ApplicationStatus;
  createdAt: Timestamp | null;
  updatedAt?: Timestamp | null;
}
