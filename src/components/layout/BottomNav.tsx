import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, User, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/profile', icon: User, label: 'Account' },
];

// Routes where bottom nav should be hidden
const HIDDEN_ROUTES = ['/cart', '/checkout', '/login', '/register', '/welcome', '/product', '/order-confirmation', '/order-tracking'];

export function BottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();

  // Hide on certain routes
  const shouldHide = HIDDEN_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50 md:hidden">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 h-full',
                'transition-colors',
                isActive ? 'text-black' : 'text-gray-400'
              )
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </NavLink>
        ))}

        {/* Cart button with badge */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 h-full relative',
              'transition-colors',
              isActive ? 'text-black' : 'text-gray-400'
            )
          }
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
              <span
                className={cn(
                  'absolute -top-1 -right-2',
                  'bg-orange-500 text-white',
                  'text-xs font-bold rounded-full',
                  'min-w-[18px] h-[18px]',
                  'flex items-center justify-center px-1'
                )}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-1 font-medium">Cart</span>
        </NavLink>
      </div>
    </nav>
  );
}
