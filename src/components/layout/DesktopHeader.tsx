import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo, SearchField, IconButton } from '@/components/shisa';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CartDropdown } from '@/components/CartDropdown';

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
  const [isCartOpen, setIsCartOpen] = useState(false);

  const shouldHide = HIDDEN_ROUTES.some((route) => location.pathname.startsWith(route));
  if (shouldHide) return null;

  return (
    <header className="hidden md:flex sh-topbar" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <Link to="/" className="flex items-center flex-shrink-0">
        <Logo size={34} />
      </Link>

      <div className="flex-1 max-w-xl">
        <SearchField
          sunken
          placeholder="Search Shisa"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3 flex-shrink-0" style={{ position: 'relative' }}>
        <IconButton icon="shopping-cart" label="Cart" badge={itemCount} onClick={() => setIsCartOpen(!isCartOpen)} />
        <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        {!user ? (
          <>
            <Link to="/login" className="sh-link">
              Log in
            </Link>
            <Link to="/register" className="sh-btn sh-btn-primary sh-btn-sm">
              Sign up
            </Link>
          </>
        ) : (
          <Link to="/profile" className="sh-link">
            {user.name?.split(' ')[0] || 'Account'}
          </Link>
        )}
      </div>
    </header>
  );
}
