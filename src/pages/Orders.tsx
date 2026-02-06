import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Loader2, Search } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusVariant } from '@/components/ui/Badge';
import api from '@/services/api';
import type { ApiOrder } from '@/types';

const ORDERS_PER_PAGE = 10;

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [orderLookup, setOrderLookup] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchOrders(1);
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const fetchOrders = async (page: number) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await api.getMyOrders(page, ORDERS_PER_PAGE);
      console.log('Orders API response:', response);

      if (response.data?.orders) {
        const ordersData = response.data.orders;
        const ordersArray = Array.isArray(ordersData)
          ? ordersData
          : (ordersData as unknown as { data: ApiOrder[] }).data || [];

        if (page === 1) {
          setOrders(ordersArray);
        } else {
          setOrders(prev => [...prev, ...ordersArray]);
        }

        // Update pagination info
        if (response.data.meta) {
          setCurrentPage(response.data.meta.current_page);
          setHasMorePages(response.data.meta.current_page < response.data.meta.last_page);
          setTotalOrders(response.data.meta.total);
        }
      } else if (response.data && Array.isArray(response.data)) {
        const dataArray = response.data as unknown as ApiOrder[];
        if (page === 1) {
          setOrders(dataArray);
        } else {
          setOrders(prev => [...prev, ...dataArray]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMorePages) {
      fetchOrders(currentPage + 1);
    }
  };

  const handleOrderLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderLookup.trim()) return;

    setLookupError(null);
    const response = await api.getOrder(orderLookup.trim());

    if (response.data?.order) {
      navigate(`/order-tracking/${orderLookup.trim()}`);
    } else {
      setLookupError('Order not found. Please check the order number.');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-nav">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-nav lg:pb-0">
      {/* Header - Mobile only */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 safe-top lg:hidden">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden lg:block px-8 py-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      <div className="px-4 lg:px-8 py-6">
        {/* Order Lookup for Guests */}
        {!isAuthenticated && (
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Track your order by entering your order number below.
            </p>
            <form onSubmit={handleOrderLookup} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter order number"
                  value={orderLookup}
                  onChange={(e) => {
                    setOrderLookup(e.target.value);
                    setLookupError(null);
                  }}
                  className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <Button type="submit">Track</Button>
            </form>
            {lookupError && (
              <p className="mt-2 text-sm text-red-600">{lookupError}</p>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-4">
                Sign in to view your order history
              </p>
              <Button onClick={() => navigate('/login')} variant="outline">
                Sign In
              </Button>
            </div>
          </div>
        )}

        {/* Order List */}
        {isAuthenticated && (
          <>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-lg font-semibold mb-2">No orders yet</h2>
                <p className="text-gray-500 text-center mb-6">
                  Place your first order and it will appear here
                </p>
                <Button onClick={() => navigate('/')}>Browse Menu</Button>
              </div>
            ) : (
              <div>
                {/* Orders count */}
                <p className="text-sm text-gray-500 mb-4">
                  Showing {orders.length} of {totalOrders} orders
                </p>

                {/* Orders Grid */}
                <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => navigate(`/order-tracking/${order.order_number}`)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-gray-300 hover:shadow-md transition-all"
                    >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">#{order.order_number}</p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(order.created_at)}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status_label}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {order.items.map((item, index) => (
                        <span key={item.id}>
                          {index > 0 && ', '}
                          {item.quantity}x {item.product_name}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="font-semibold">R{order.total.toFixed(2)}</span>
                      <span className="text-sm text-orange-500">View details →</span>
                    </div>
                    </button>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMorePages && (
                  <div className="pt-4 lg:flex lg:justify-center">
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      isLoading={isLoadingMore}
                      className="w-full lg:w-auto lg:px-8"
                    >
                      {isLoadingMore ? 'Loading...' : 'Load More Orders'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
