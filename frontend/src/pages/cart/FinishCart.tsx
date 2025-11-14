import { Button, Empty, Space, Table, Toast } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';

const FinishCart = () => {
  const navigate = useNavigate();
  const { cart, getTotal, clearCart } = useCartStore();
  const { user_id } = useUserStore();

  const totalPrice = getTotal();

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
        total_amount: totalPrice,
        product_list: productList
      };

      // 调用后端API创建订单
      const response = await fetch('/api/order/user/create', {
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
                    <span>¥{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 text-base">
                    <span className="text-gray-600">运费：</span>
                    <span>¥0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold text-gray-900 border-t pt-4">
                    <span>合计：</span>
                    <span className="text-2xl text-red-600">
                      ¥{totalPrice.toFixed(2)}
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
