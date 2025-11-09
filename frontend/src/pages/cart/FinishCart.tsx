import { Button, Empty, Space, Table } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

const FinishCart = () => {
  const navigate = useNavigate();
  const { cart, getTotal } = useCartStore();

  const totalPrice = getTotal();

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
                size="large"
                onClick={() => {
                  // 暂时占位，后续添加支付功能
                  console.log('支付功能待实现');
                }}
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
