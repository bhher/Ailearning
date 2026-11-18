import { useEffect, useMemo, useState } from 'react';
import { signOut, type User } from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Home as HomeIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { auth } from '../firebase';
import {
  deleteApplication,
  getApplications,
  subscribeApplications,
  updateApplicationStatus,
} from '../services/applicationService';
import {
  APPLICATION_STATUS_LIST,
  type ApplicationRecord,
  ApplicationStatus,
  COURSE_TITLES,
} from '../types/application';

interface AdminDashboardProps {
  user: User;
  onNavigateHome: () => void;
}

type AdminSection = 'overview' | 'applications';

const ITEMS_PER_PAGE = 8;

function formatDateTime(timestamp: ApplicationRecord['createdAt']): string {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '-';
  const date = timestamp.toDate();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${d} ${hh}:${mm}`;
}

function isSameLocalDay(timestamp: ApplicationRecord['createdAt'], now: Date): boolean {
  if (!timestamp || typeof timestamp.toDate !== 'function') return false;
  const date = timestamp.toDate();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  switch (status) {
    case ApplicationStatus.APPROVED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>승인완료</span>
        </span>
      );
    case ApplicationStatus.REVIEWING:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>검토중</span>
        </span>
      );
    case ApplicationStatus.CANCELLED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
          <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>취소</span>
        </span>
      );
    case ApplicationStatus.RECEIVED:
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
          <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>신청접수</span>
        </span>
      );
  }
}

export default function AdminDashboard({ user, onNavigateHome }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Selected application for detail modal
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApplicationRecord | null>(null);

  // Mutation states
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    setLoadError('');

    const unsubscribe = subscribeApplications(
      (records) => {
        setApplications(records);
        setLoading(false);
        setSelectedApp((prev) =>
          prev ? records.find((item) => item.id === prev.id) ?? null : null
        );
      },
      (error) => {
        setLoading(false);
        setLoadError(
          error.message.includes('Missing or insufficient permissions')
            ? '관리자 권한이 확인되지 않아 신청 데이터를 조회할 수 없습니다.'
            : '수강신청 내역을 불러오는 중 오류가 발생했습니다.'
        );
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Close modals on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteTarget && !isDeleting) setDeleteTarget(null);
        else if (selectedApp) setSelectedApp(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteTarget, isDeleting, selectedApp]);

  const stats = useMemo(() => {
    const now = new Date();
    const total = applications.length;
    const todayCount = applications.filter((app) => isSameLocalDay(app.createdAt, now)).length;
    const receivedCount = applications.filter(
      (app) => app.status === ApplicationStatus.RECEIVED
    ).length;
    const approvedCount = applications.filter(
      (app) => app.status === ApplicationStatus.APPROVED
    ).length;

    return { total, todayCount, receivedCount, approvedCount };
  }, [applications]);

  const courseBreakdown = useMemo(() => {
    return COURSE_TITLES.map((title) => ({
      title,
      count: applications.filter((a) => a.course === title).length,
    }));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesQuery =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.phone.toLowerCase().includes(q);
      const matchesCourse = courseFilter === 'all' || app.course === courseFilter;
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesQuery && matchesCourse && matchesStatus;
    });
  }, [applications, searchQuery, courseFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, courseFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedApplications = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredApplications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredApplications, safePage]);

  const handleManualRefresh = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const records = await getApplications();
      setApplications(records);
      setToast({ type: 'success', text: '최신 수강신청 데이터를 불러왔습니다.' });
    } catch {
      setLoadError('수강신청 목록을 새로고침하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, nextStatus: ApplicationStatus) => {
    setUpdatingId(id);
    try {
      await updateApplicationStatus(id, nextStatus);
      setToast({ type: 'success', text: `신청 상태가 '${nextStatus}'(으)로 변경되었습니다.` });
    } catch {
      setToast({
        type: 'error',
        text: '상태 변경에 실패했습니다. 관리자 권한 및 네트워크 상태를 확인해 주세요.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteApplication(deleteTarget.id);
      if (selectedApp?.id === deleteTarget.id) {
        setSelectedApp(null);
      }
      setToast({
        type: 'success',
        text: `${deleteTarget.name}님의 수강신청 내역이 삭제되었습니다.`,
      });
      setDeleteTarget(null);
    } catch {
      setToast({
        type: 'error',
        text: '데이터 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCourseFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 w-64">
      <div className="h-16 px-6 flex items-center border-b border-slate-800/80">
        <span className="font-display text-lg font-extrabold tracking-tight text-white">
          AI LEARNING
        </span>
      </div>

      <nav aria-label="관리자 사이드바 메뉴" className="flex-1 p-4 space-y-1">
        <button
          type="button"
          onClick={() => {
            setActiveSection('overview');
            setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
            activeSection === 'overview'
              ? 'bg-blue-700 text-white'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>대시보드</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSection('applications');
            setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
            activeSection === 'applications'
              ? 'bg-blue-700 text-white'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-3">
            <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>수강신청 관리</span>
          </span>
          <span className="font-mono-tabular text-xs opacity-80">{applications.length}</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800/80 space-y-1">
        <button
          type="button"
          onClick={onNavigateHome}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <HomeIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>메인 사이트 이동</span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-red-300 hover:bg-red-950/50 hover:text-red-200 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 border-r border-slate-200">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="관리자 메뉴"
        >
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 h-full">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Admin Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="메뉴 열기"
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {activeSection === 'overview' ? '관리자 대시보드' : '수강신청 관리'}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className="hidden sm:inline text-xs sm:text-sm text-slate-600 font-mono truncate max-w-[220px]">
              {user.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>로그아웃</span>
            </button>
          </div>
        </header>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm">
            <div
              role="status"
              className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium ${
                toast.type === 'success'
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-red-600 text-white border-red-700'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-100 shrink-0" aria-hidden="true" />
              )}
              <span>{toast.text}</span>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* KPI Stat Cards */}
          <section aria-label="신청 현황 요약" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500 mb-2">전체 신청자 수</p>
              <p className="font-mono-tabular text-3xl font-bold text-slate-900">
                {loading ? '-' : `${stats.total}명`}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500 mb-2">오늘 신청자 수</p>
              <p className="font-mono-tabular text-3xl font-bold text-blue-700">
                {loading ? '-' : `${stats.todayCount}명`}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500 mb-2">신청접수 건수</p>
              <p className="font-mono-tabular text-3xl font-bold text-slate-900">
                {loading ? '-' : `${stats.receivedCount}건`}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500 mb-2">승인완료 건수</p>
              <p className="font-mono-tabular text-3xl font-bold text-emerald-700">
                {loading ? '-' : `${stats.approvedCount}건`}
              </p>
            </div>
          </section>

          {/* Overview Course Distribution (only on Overview tab) */}
          {activeSection === 'overview' && (
            <section className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">과정별 수강신청 현황</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    개설된 5개 정규 과정의 누적 신청 분포입니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('applications')}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer whitespace-nowrap"
                >
                  전체 관리 테이블 열기 →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {courseBreakdown.map((item) => {
                  const ratio = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
                  return (
                    <div
                      key={item.title}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3"
                    >
                      <p className="text-xs font-medium text-slate-700 leading-snug">
                        {item.title}
                      </p>
                      <div>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="font-mono-tabular text-lg font-bold text-slate-900">
                            {item.count}건
                          </span>
                          <span className="font-mono-tabular text-xs text-slate-500">{ratio}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-700 rounded-full transition-all"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Applications Management Table Section */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {activeSection === 'overview' ? '최근 수강신청 내역' : '전체 수강신청 관리'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    최신 신청순으로 정렬되며, 상태 변경 시 Firebase에 즉시 반영됩니다.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                      aria-hidden="true"
                    />
                    <span>새로고침</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5 relative">
                  <label htmlFor="admin-search" className="sr-only">
                    신청자 이름, 이메일 또는 휴대폰 검색
                  </label>
                  <Search
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="admin-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="신청자 이름, 이메일, 휴대폰 검색..."
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
                  />
                </div>

                <div className="md:col-span-3">
                  <label htmlFor="admin-course-filter" className="sr-only">
                    강의별 필터
                  </label>
                  <select
                    id="admin-course-filter"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
                  >
                    <option value="all">전체 강의</option>
                    {COURSE_TITLES.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="admin-status-filter" className="sr-only">
                    신청 상태별 필터
                  </label>
                  <select
                    id="admin-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
                  >
                    <option value="all">전체 상태</option>
                    {APPLICATION_STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="w-full px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    필터 초기화
                  </button>
                </div>
              </div>
            </div>

            {loadError ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-slate-900">{loadError}</p>
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  다시 불러오기
                </button>
              </div>
            ) : loading ? (
              <div className="p-6 space-y-3" aria-label="수강신청 데이터 로딩 중">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-11 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-900">
                  {applications.length === 0
                    ? '아직 접수된 수강신청 내역이 없습니다.'
                    : '검색 조건에 일치하는 수강신청 내역이 없습니다.'}
                </p>
                <p className="text-xs text-slate-500">
                  {applications.length === 0
                    ? '메인 페이지에서 수강신청이 접수되면 이곳에 실시간으로 표시됩니다.'
                    : '검색어 또는 필터 조건을 변경해 보세요.'}
                </p>
                {applications.length > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    전체 목록 보기
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                        <th className="py-3 px-4 w-14 text-center whitespace-nowrap">번호</th>
                        <th className="py-3 px-4 whitespace-nowrap">이름</th>
                        <th className="py-3 px-4 whitespace-nowrap">이메일</th>
                        <th className="py-3 px-4 whitespace-nowrap">휴대폰</th>
                        <th className="py-3 px-4 whitespace-nowrap">신청 강의</th>
                        <th className="py-3 px-4 whitespace-nowrap">신청일</th>
                        <th className="py-3 px-4 whitespace-nowrap">상태</th>
                        <th className="py-3 px-4 text-right whitespace-nowrap">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {paginatedApplications.map((app, index) => {
                        const rowNumber =
                          filteredApplications.length -
                          ((safePage - 1) * ITEMS_PER_PAGE + index);
                        const isRowUpdating = updatingId === app.id;
                        return (
                          <tr
                            key={app.id}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="py-3 px-4 text-center font-mono-tabular text-xs text-slate-500">
                              {rowNumber}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                              {app.name}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-mono text-xs whitespace-nowrap">
                              {app.email}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-mono-tabular text-xs whitespace-nowrap">
                              {app.phone}
                            </td>
                            <td className="py-3 px-4 text-slate-800 whitespace-nowrap">
                              {app.course}
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-mono-tabular text-xs whitespace-nowrap">
                              {formatDateTime(app.createdAt)}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <StatusBadge status={app.status} />
                                <label htmlFor={`status-select-${app.id}`} className="sr-only">
                                  {app.name} 상태 변경
                                </label>
                                <select
                                  id={`status-select-${app.id}`}
                                  value={app.status}
                                  disabled={isRowUpdating}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      app.id,
                                      e.target.value as ApplicationStatus
                                    )
                                  }
                                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:border-blue-700 disabled:opacity-50 cursor-pointer"
                                >
                                  {APPLICATION_STATUS_LIST.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedApp(app)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>상세보기</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(app)}
                                  aria-label={`${app.name} 신청 내역 삭제`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>삭제</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                  <p className="font-mono-tabular">
                    총 {filteredApplications.length}건 중{' '}
                    {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(safePage * ITEMS_PER_PAGE, filteredApplications.length)}건 표시
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      aria-label="이전 페이지"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-md font-mono-tabular text-xs font-semibold transition-colors cursor-pointer ${
                            safePage === pageNum
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      aria-label="다음 페이지"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedApp(null);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 id="detail-modal-title" className="text-base font-bold text-slate-900">
                수강신청 상세 정보
              </h2>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                aria-label="상세보기 닫기"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-slate-500 mb-1">이름</dt>
                  <dd className="font-semibold text-slate-900">{selectedApp.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">신청 상태</dt>
                  <dd>
                    <StatusBadge status={selectedApp.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">이메일</dt>
                  <dd className="font-mono text-xs text-slate-800 break-all">
                    {selectedApp.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">휴대폰 번호</dt>
                  <dd className="font-mono-tabular text-slate-800">{selectedApp.phone}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">신청 강의</dt>
                  <dd className="font-medium text-slate-900">{selectedApp.course}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">신청일</dt>
                  <dd className="font-mono-tabular text-slate-700">
                    {formatDateTime(selectedApp.createdAt)}
                  </dd>
                </div>
              </dl>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">신청 동기</p>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.motivation}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label
                  htmlFor="detail-status-select"
                  className="block text-xs font-semibold text-slate-700 mb-2"
                >
                  신청 상태 변경
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="detail-status-select"
                    value={selectedApp.status}
                    disabled={updatingId === selectedApp.id}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedApp.id,
                        e.target.value as ApplicationStatus
                      )
                    }
                    className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                  >
                    {APPLICATION_STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(selectedApp)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    <span>삭제</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeleteTarget(null);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h2 id="delete-modal-title" className="text-base font-bold text-slate-900">
              수강신청 데이터 삭제
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-900">{deleteTarget.name}</span>님의{' '}
              <span className="font-medium text-slate-900">{deleteTarget.course}</span> 신청
              내역을 영구적으로 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>삭제 중...</span>
                  </>
                ) : (
                  <span>삭제 확인</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
