import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search } from 'lucide-react';
import Logo from '@/assets/logo.png';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Routes where header should be hidden
const HIDDEN_ROUTES = ['/login', '/register', '/welcome'];

interface DesktopHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function DesktopHeader({ searchQuery = '', onSearchChange }: DesktopHeaderProps) {
  const location = useLocation();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [orderType, setOrderType] = useState<'delivery' | 'collection'>('delivery');

  // Hide on certain routes
  const shouldHide = HIDDEN_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  if (shouldHide) return null;

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="px-6">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={Logo} alt="Kasi Bites" className="w-10 h-10" />
            <span className="text-xl font-bold">Kasi Bites</span>
          </Link>

          {/* Delivery/Collection Toggle */}
          <div className="hidden lg:flex items-center bg-gray-100 rounded-full p-1 flex-shrink-0">
            <button
              onClick={() => setOrderType('delivery')}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                orderType === 'delivery'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              )}
            >
              Delivery
            </button>
            <button
              onClick={() => setOrderType('collection')}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                orderType === 'collection'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              )}
            >
              Collection
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Kasi Bites"
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-gray-100 rounded-full pl-12 pr-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-gray-50 transition-colors"
              />
            </div>
          </div>

          {/* Spacer to push right content to the edge */}
          <div className="flex-1" />

          {/* Right Side Actions - Far right corner */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Cart button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="text-sm font-medium">{itemCount}</span>
              )}
            </Link>

            {/* Auth Buttons */}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <Link
                to="/profile"
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-3 py-2"
              >
                {user.name?.split(' ')[0] || 'Account'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
