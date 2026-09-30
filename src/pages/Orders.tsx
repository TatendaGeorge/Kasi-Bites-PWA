import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { formatDateTime, getStatusTone } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import type { ApiOrder } from '@/types';
import { Button, SearchField, Icon, OrderCard } from '@/components/shisa';

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

      if (response.data?.orders) {
        const ordersData = response.data.orders;
        const ordersArray = Array.isArray(ordersData) ? ordersData : (ordersData as unknown as { data: ApiOrder[] }).data || [];

        if (page === 1) {
          setOrders(ordersArray);
        } else {
          setOrders((prev) => [...prev, ...ordersArray]);
        }

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
          setOrders((prev) => [...prev, ...dataArray]);
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
      <div className="flex items-center justify-center pb-nav" style={{ minHeight: '100dvh' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--flame)' }} />
      </div>
    );
  }

  return (
    <div className="pb-nav lg:pb-0" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <div className="safe-top sh-pad lg:px-8 lg:py-6" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ font: '600 28px/34px var(--font-display)', color: 'var(--ink)' }}>My orders</h1>
      </div>

      <div className="sh-pad lg:px-8 lg:py-6">
        {!isAuthenticated && (
          <div className="mb-6">
            <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
              Track your order by entering your order number below.
            </p>
            <form onSubmit={handleOrderLookup} className="flex gap-2">
              <SearchField
                icon="receipt-text"
                placeholder="Enter order number"
                value={orderLookup}
                onChange={(e) => {
                  setOrderLookup(e.target.value);
                  setLookupError(null);
                }}
              />
              <Button type="submit">Track</Button>
            </form>
            {lookupError && (
              <p className="mt-2 text-sm" style={{ color: 'var(--danger)' }}>
                {lookupError}
              </p>
            )}

            <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--line)' }}>
              <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
                Sign in to view your order history
              </p>
              <Button onClick={() => navigate('/login')} variant="secondary">
                Sign in
              </Button>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div
                  className="flex items-center justify-center mb-4"
                  style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface-sunken)' }}
                >
                  <Icon name="receipt-text" size={40} style={{ color: 'var(--ink-subtle)' }} />
                </div>
                <h2 className="mb-2" style={{ font: '600 18px/24px var(--font-display)', color: 'var(--ink)' }}>
                  No orders yet
                </h2>
                <p className="text-center mb-6" style={{ color: 'var(--ink-muted)' }}>
                  Place your first order and it will appear here
                </p>
                <Button onClick={() => navigate('/')}>Browse stores</Button>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>
                  Showing {orders.length} of {totalOrders} orders
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      status={order.status_label}
                      tone={getStatusTone(order.status)}
                      date={formatDateTime(order.created_at)}
                      name={`#${order.order_number}`}
                      cuisine={order.items.map((item) => `${item.quantity}x ${item.product_name}`).join(', ')}
                      image="kota"
                      total={`R${order.total.toFixed(2)}`}
                      items={order.items.length}
                      actions={false}
                      onClick={() => navigate(`/order-tracking/${order.order_number}`)}
                    />
                  ))}
                </div>

                {hasMorePages && (
                  <div className="pt-4 lg:flex lg:justify-center">
                    <Button onClick={handleLoadMore} variant="secondary" disabled={isLoadingMore} block>
                      {isLoadingMore ? 'Loading…' : 'Load more orders'}
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
