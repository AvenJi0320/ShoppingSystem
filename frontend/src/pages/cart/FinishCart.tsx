import { Button, Empty, Space, Table, Toast } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { useState, useEffect } from 'react';

interface Promotion {
  promotion_id: number;
  title: string;
  description?: string;
  type: number;
  rules: PromotionRule[];
}

interface PromotionRule {
  rule_id: number;
  condition_type: number;
  condition_value: number;
  discount_type: number;
  discount_value: number;
  product_id?: number;
  product?: {
    product_id: number;
    product_name: string;
  };
}

const FinishCart = () => {
  const navigate = useNavigate();
  const { cart, getTotal, clearCart } = useCartStore();
  const { user_id } = useUserStore();

  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const originalTotal = getTotal();
  const finalTotal = originalTotal - discountAmount;

  // 获取可用促销活动
  useEffect(() => {
    const fetchAvailablePromotions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/promotions/available');
        const result = await response.json();
        if (result.success) {
          setAvailablePromotions(result.data);
        }
      } catch (error) {
        console.error('获取促销活动失败:', error);
      }
    };

    if (cart.length > 0) {
      fetchAvailablePromotions();
    }
  }, [cart]);

  // 计算优惠金额
  useEffect(() => {
    if (selectedPromotion && cart.length > 0) {
      const discount = calculateDiscount(selectedPromotion, cart, originalTotal);
      setDiscountAmount(discount);
    } else {
      setDiscountAmount(0);
    }
  }, [selectedPromotion, cart, originalTotal]);

  // 计算优惠金额的函数
  const calculateDiscount = (promotion: Promotion, cartItems: any[], total: number): number => {
    let discount = 0;

    for (const rule of promotion.rules) {
      // 检查条件是否满足
      let conditionMet = false;

      if (rule.condition_type === 1) { // 满金额
        conditionMet = total >= rule.condition_value;
      } else if (rule.condition_type === 2) { // 满数量
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        conditionMet = totalQuantity >= rule.condition_value;
      }

      if (conditionMet) {
        // 计算优惠
        if (rule.discount_type === 1) { // 减金额
          discount += rule.discount_value;
        } else if (rule.discount_type === 2) { // 打折
          discount += total * (rule.discount_value / 10); // 例如8折就是0.8
        }
        // 其他优惠类型可以后续添加
      }
    }

    return Math.min(discount, total); // 优惠不能超过商品总价
  };

  // 处理确认订单
  const handleConfirmOrder = async () => {
    // 检查用户是否登录
    if (!user_id) {
      Toast.error('请先登录后再下单');
      navigate('/login');
      return;
    }

    // 检查购物车是否为空
    if (cart.length === 0) {
      Toast.error('购物车为空，无法创建订单');
      return;
    }

    try {
      // 准备订单数据
      const productList = cart.map(item => item.product_id);
      
      const orderData = {
        user_id: user_id,
        total_amount: finalTotal, // 使用优惠后的价格
        product_list: productList,
        promotion_id: selectedPromotion?.promotion_id || null,
        discount_amount: discountAmount
      };

      // 调用后端API创建订单
      const response = await fetch('http://localhost:3000/api/order/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 订单创建成功
        Toast.success('订单创建成功！');
        
        // 清空购物车
        clearCart();
        
        // 跳转到订单页面
        navigate('/order');
      } else {
        // 订单创建失败
        Toast.error(result.message || '订单创建失败，请重试');
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      Toast.error('网络请求失败，请检查网络连接');
    }
  };

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: '单价（¥）',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toFixed(2),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '小计（¥）',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (_: any, record: any) => (record.price * record.quantity).toFixed(2),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-100 p-5">
      {/* 顶部导航栏 */}
      <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 m-0">订单确认</h1>
        <Button type="tertiary" onClick={() => navigate('/shop')}>
          返回购物
        </Button>
      </div>

      {/* 订单内容 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {cart.length === 0 ? (
          <Empty description="购物车为空，请先添加商品" />
        ) : (
          <Space vertical spacing={24} style={{ width: '100%' }}>
            {/* 订单列表 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">订单明细</h2>
              <Table
                columns={columns}
                dataSource={cart.map((item) => ({
                  ...item,
                  key: item.product_id,
                }))}
                pagination={false}
                size="small"
              />
            </div>

            {/* 价格总计 */}
            <div className="border-t pt-6">
              <div className="flex justify-end">
                <div className="w-80">
                  <div className="flex justify-between items-center mb-4 text-base">
                    <span className="text-gray-600">小计：</span>
                    <span>¥{originalTotal.toFixed(2)}</span>
                  </div>
                  
                  {/* 促销活动选择 */}
                  {availablePromotions.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        选择优惠活动：
                      </label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={selectedPromotion?.promotion_id || ''}
                        onChange={(e) => {
                          const promotionId = parseInt(e.target.value);
                          const promotion = availablePromotions.find(p => p.promotion_id === promotionId);
                          setSelectedPromotion(promotion || null);
                        }}
                      >
                        <option value="">不使用优惠</option>
                        {availablePromotions.map(promotion => (
                          <option key={promotion.promotion_id} value={promotion.promotion_id}>
                            {promotion.title}
                          </option>
                        ))}
                      </select>
                      {selectedPromotion && (
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedPromotion.description}
                        </p>
                      )}
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center mb-4 text-base text-green-600">
                      <span>优惠：</span>
                      <span>-¥{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-4 text-base">
                    <span className="text-gray-600">运费：</span>
                    <span>¥0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold text-gray-900 border-t pt-4">
                    <span>合计：</span>
                    <span className="text-2xl text-red-600">
                      ¥{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-4 border-t pt-6">
              <Button
                type="tertiary"
                size="large"
                onClick={() => navigate('/shop')}
              >
                继续购物
              </Button>
              <Button
                type="primary"
                theme="solid"
                size="large"
                onClick={handleConfirmOrder}
                style={{ width: '200px' }}
              >
                确认付款
              </Button>
            </div>
          </Space>
        )}
      </div>
    </div>
  );
};

export default FinishCart;
