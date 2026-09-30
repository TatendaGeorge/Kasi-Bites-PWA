import { Link, useLocation } from 'react-router-dom';
import { SideNav } from '@/components/shisa';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { path: '/', icon: 'house', label: 'Stores' },
  { path: '/orders', icon: 'receipt-text', label: 'Orders' },
  { path: '/profile', icon: 'circle-user', label: 'Account' },
];

// Routes where sidebar should be hidden
const HIDDEN_ROUTES = ['/login', '/register', '/welcome', '/store/', '/cart', '/checkout', '/order-confirmation', '/order-tracking'];

export function DesktopSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const shouldHide = HIDDEN_ROUTES.some((route) => location.pathname.startsWith(route));
  if (shouldHide) return null;

  return (
    <aside
      className="hidden lg:flex flex-col w-56 fixed left-0 top-16 bottom-0 z-40"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--line)' }}
    >
      <div className="flex-1 py-4 px-3">
        <SideNav items={NAV_ITEMS.map((i) => ({ label: i.label, icon: i.icon, path: i.path, end: i.path === '/' }))} />
      </div>

      {!user && (
        <div className="p-4 flex flex-col gap-1" style={{ borderTop: '1px solid var(--line)' }}>
          <Link to="/register" className="sh-side-item">
            Sign up
          </Link>
          <Link to="/login" className="sh-side-item">
            Log in
          </Link>
        </div>
      )}
    </aside>
  );
}
