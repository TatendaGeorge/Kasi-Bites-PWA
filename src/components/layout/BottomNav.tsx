import { useLocation } from 'react-router-dom';
import { BottomNav as ShisaBottomNav } from '@/components/shisa';
import { useCart } from '@/context/CartContext';

// Routes where bottom nav should be hidden
const HIDDEN_ROUTES = ['/cart', '/checkout', '/login', '/register', '/welcome', '/store/', '/order-confirmation', '/order-tracking'];

export function BottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();

  const shouldHide = HIDDEN_ROUTES.some((route) => location.pathname.startsWith(route));
  if (shouldHide) return null;

  const items = [
    { path: '/', icon: 'house', label: 'Stores', end: true },
    { path: '/orders', icon: 'receipt-text', label: 'Orders' },
    { path: '/cart', icon: 'shopping-cart', label: 'Cart', badge: itemCount || undefined },
    { path: '/profile', icon: 'circle-user', label: 'Account' },
  ];

  return <ShisaBottomNav items={items} />;
}
