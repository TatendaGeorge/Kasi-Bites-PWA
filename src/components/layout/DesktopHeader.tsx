import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Home, ClipboardList, User } from 'lucide-react';
import Logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/profile', icon: User, label: 'Account' },
];

// Routes where header should be hidden
const HIDDEN_ROUTES = ['/login', '/register', '/welcome'];

export function DesktopHeader() {
  const location = useLocation();
  const { itemCount } = useCart();

  // Hide on certain routes
  const shouldHide = HIDDEN_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  if (shouldHide) return null;

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Kasi Bites" className="w-12 h-12" />
            <span className="text-xl font-bold">Kasi Bites</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            {NAV_ITEMS.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors hover:text-black',
                    isActive ? 'text-black' : 'text-gray-500'
                  )
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Cart button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm font-medium">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
