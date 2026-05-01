import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="lg:pl-60 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
