import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, User, UserPlus, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/profile', icon: User, label: 'Account' },
];

// Routes where sidebar should be hidden
const HIDDEN_ROUTES = ['/login', '/register', '/welcome', '/product/', '/cart', '/checkout', '/order-confirmation', '/order-tracking'];

export function DesktopSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  // Hide on certain routes
  const shouldHide = HIDDEN_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  if (shouldHide) return null;

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 fixed left-0 top-16 bottom-0 z-40">
      {/* Main Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  )
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section - Auth */}
      {!user && (
        <div className="border-t border-gray-100 p-4 space-y-2">
          <NavLink
            to="/register"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Sign up
          </NavLink>
          <NavLink
            to="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Log in
          </NavLink>
        </div>
      )}
    </aside>
  );
}
