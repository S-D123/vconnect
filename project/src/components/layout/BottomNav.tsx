import { NavLink } from 'react-router-dom';
import { Home, Search, Bell, User, Settings, SquarePen, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/notifications', icon: Bell, label: 'Alerts', badge: true },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const { user } = useAuth();
  const canCreatePost = Boolean(user?.isClub && user.clubId);
  const canViewAnalytics = Boolean(user?.clubId && (user?.isClub || (user?.role ?? '').toLowerCase() === 'admin'));

  const items = [
    ...navItems,
    ...(canCreatePost ? [{ to: `/clubs/${user!.clubId}/create-post`, icon: SquarePen, label: 'Create' }] : []),
    ...(canViewAnalytics ? [{ to: `/clubs/${user!.clubId}/comment-analytics`, icon: BarChart3, label: 'Insights' }] : []),
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl transition-all duration-150 ${
                isActive ? 'text-teal-500' : 'text-gray-400 dark:text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full" />
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
