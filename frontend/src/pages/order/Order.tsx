import { useEffect, useState } from 'react';
import { Spin } from '@douyinfe/semi-ui';
import { useUserStore } from '../../store/userStore';
import OrderItem from './components/OrderItem';
import type { Order as OrderType } from './types';

const Order = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user_id = useUserStore((state) => state.user_id);

  useEffect(() => {
    fetchOrders();
  }, [user_id]);

  const fetchOrders = async () => {
    if (!user_id) {
      setError('请先登录');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/api/order/user/${user_id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setOrders(result.data);
      } else {
        setError(result.message || '获取订单失败');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError(error instanceof Error ? error.message : '获取订单失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user_id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">请先登录</h1>
          <p className="text-gray-600">访问订单列表需要登录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">我的订单</h1>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spin />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                重试
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">暂无订单</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderItem key={order.order_id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;