import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { StoreSettingsProvider } from '@/context/StoreSettingsContext';
import { BottomNav } from '@/components/layout/BottomNav';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <StoreSettingsProvider>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen bg-gray-50 md:bg-gray-100">
                {/* Desktop Header */}
                <DesktopHeader />

                {/* Main Content */}
                <main className="md:max-w-6xl md:mx-auto md:px-6 md:py-6">
                  <div className="bg-white md:rounded-2xl md:shadow-sm md:min-h-[calc(100vh-120px)]">
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
            </CartProvider>
          </AuthProvider>
        </StoreSettingsProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
