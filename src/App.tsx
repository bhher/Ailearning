import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import ApplicationModal from './components/ApplicationModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { auth } from './firebase';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Home from './pages/Home';
import { checkAdminAccess } from './services/applicationService';
import type { CourseTitle } from './types/application';

type AppView = 'home' | 'admin';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseTitle | ''>('');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setCheckingRole(true);
        const allowed = await checkAdminAccess(user.uid, user.email, user.emailVerified);
        setIsAdmin(allowed);
        setCheckingRole(false);
      } else {
        setIsAdmin(false);
        setCheckingRole(false);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenApplicationModal = (course?: CourseTitle) => {
    setSelectedCourse(course ?? '');
    setModalOpen(true);
  };

  return (
    <ErrorBoundary>
      {view === 'home' ? (
        <>
          <Home
            onOpenApplicationModal={handleOpenApplicationModal}
            onOpenAdmin={() => setView('admin')}
          />
          <ApplicationModal
            isOpen={modalOpen}
            initialCourse={selectedCourse}
            onClose={() => setModalOpen(false)}
          />
        </>
      ) : authReady && currentUser && isAdmin ? (
        <AdminDashboard user={currentUser} onNavigateHome={() => setView('home')} />
      ) : (
        <AdminLogin
          currentUser={currentUser}
          isAdmin={isAdmin}
          checkingRole={!authReady || checkingRole}
          onBackHome={() => setView('home')}
        />
      )}
    </ErrorBoundary>
  );
}
