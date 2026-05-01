import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Bell, User, Settings, LogOut, Zap, SquarePen, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const canCreatePost = Boolean(user?.clubId && (user?.role ?? '').toLowerCase() === 'admin');
  const canViewAnalytics = Boolean(user?.clubId && (user?.isClub || (user?.role ?? '').toLowerCase() === 'admin'));

  const items = [
    ...navItems,
    ...(canCreatePost ? [{ to: `/clubs/${user!.clubId}/create-post`, icon: SquarePen, label: 'Create Post' }] : []),
    ...(canViewAnalytics ? [{ to: `/clubs/${user!.clubId}/comment-analytics`, icon: BarChart3, label: 'Analytics' }] : []),
  ];

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
          <Zap size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          v<span className="text-teal-500">connect</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'text-teal-500' : 'group-hover:text-gray-700 dark:group-hover:text-gray-300'}
                />
                <span>{label}</span>
                {label === 'Notifications' && (
                  <span className="ml-auto w-2 h-2 bg-teal-500 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-gray-200 dark:border-gray-800 pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-600 dark:text-teal-400 text-sm font-semibold">
              {user?.name?.[0] ?? 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.studentId}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
