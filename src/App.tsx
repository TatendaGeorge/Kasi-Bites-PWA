import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { StoreSettingsProvider } from '@/context/StoreSettingsContext';
import { BottomNav } from '@/components/layout/BottomNav';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { ScrollToTop } from '@/components/ScrollToTop';
import {
  Home,
  ProductDetail,
  Cart,
  Checkout,
  OrderConfirmation,
  OrderTracking,
  Orders,
  Profile,
  Login,
  Register,
  Welcome,
} from '@/pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Routes that should have the sidebar layout
const SIDEBAR_ROUTES = ['/', '/orders', '/profile'];

function AppLayout() {
  const location = useLocation();

  // Check if current route should show sidebar
  const showSidebar = SIDEBAR_ROUTES.some(route =>
    location.pathname === route ||
    (route !== '/' && location.pathname.startsWith(route))
  );

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-white">
      {/* Desktop Header */}
      <DesktopHeader />

      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content */}
      <main className={`
        ${showSidebar ? 'lg:ml-56' : ''}
        md:pt-0
      `}>
        <div className={`
          ${!showSidebar ? 'md:max-w-4xl md:mx-auto' : ''}
        `}>
          <Routes>
            {/* Main Tab Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />

            {/* Stack Routes */}
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
            <Route path="/order-tracking/:orderNumber" element={<OrderTracking />} />

            {/* Auth Routes */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* Bottom Navigation (mobile only) */}
      <BottomNav />

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#000',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <StoreSettingsProvider>
          <AuthProvider>
            <CartProvider>
              <AppLayout />
            </CartProvider>
          </AuthProvider>
        </StoreSettingsProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
