import { useState, useEffect } from 'react';
import { IconChevronDown, IconChevronUp } from '@douyinfe/semi-icons';
import type { Order, OrderProduct } from '../types';
import { ORDER_STATUS_MAP } from '../types';

interface OrderItemProps {
  order: Order;
}

const OrderItem = ({ order }: OrderItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded && products.length === 0) {
      fetchProducts();
    }
  }, [isExpanded]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productIds = order.product_list.split(',').map(id => parseInt(id));
      const response = await fetch('http://localhost:3000/api/products');
      const result = await response.json();

      if (result.data) {
        const allProducts = result.data;
        const orderProducts: OrderProduct[] = [];

        productIds.forEach(productId => {
          const product = allProducts.find((p: any) => p.product_id === productId);
          if (product) {
            const existing = orderProducts.find(op => op.product_id === productId);
            if (existing) {
              existing.quantity += 1;
            } else {
              orderProducts.push({
                product_id: product.product_id,
                product_name: product.product_name,
                price: product.price,
                quantity: 1,
              });
            }
          }
        });

        setProducts(orderProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProductTotal = (product: OrderProduct) => {
    return product.price * product.quantity;
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'text-amber-600';
      case 1:
        return 'text-green-600';
      case 2:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderProductsContent = () => {
    if (loading) {
      return <div className="text-center text-gray-400 py-4">加载中...</div>;
    }

    if (products.length === 0) {
      return <div className="text-center text-gray-400 py-4">暂无商品信息</div>;
    }

    return (
      <div className="space-y-3">
        {products.map(product => (
          <div key={product.product_id} className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="flex-1 font-medium text-gray-800">{product.product_name}</span>
            <span className="text-gray-600 min-w-20 text-right">数量: {product.quantity}</span>
            <span className="text-red-600 font-semibold min-w-32 text-right">
              小计: ¥{calculateProductTotal(product).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="pt-3 border-t-2 border-gray-300 text-right">
          <strong className="text-lg text-red-600">订单总价: ¥{order.total_amount.toFixed(2)}</strong>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div
        className="flex justify-between items-center px-6 py-5 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex w-full items-center">
          <div className="flex-1 font-semibold text-gray-800 min-w-40">订单号: {order.order_id}</div>
          <div className="flex-1 text-gray-600">
            状态: <span className={`font-semibold ${getStatusColor(order.order_status)}`}>
              {ORDER_STATUS_MAP[order.order_status] || '未知'}
            </span>
          </div>
          <div className="flex-1 text-gray-600">
            总价: <span className="text-red-600 font-bold text-base">¥{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-gray-500 text-lg transition-colors hover:text-gray-700">
          {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-5 bg-white border-t border-gray-200">
          {renderProductsContent()}
        </div>
      )}
    </div>
  );
};

export default OrderItem;