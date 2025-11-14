import { Modal, Button, Space, Empty, InputNumber } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import type {CartItem} from '../types';

interface CartModalProps {
  visible: boolean;
  cart: CartItem[];
  onCancel: () => void;
  onRemove: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
}

const CartModal = ({ visible, cart, onCancel, onRemove, onUpdateQuantity }: CartModalProps) => {
  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cart.length > 0) {
      onCancel();
      navigate('/finish_cart');
    }
  };

  return (
    <Modal
      title="购物车"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      size="large"
    >
      {cart.length === 0 ? (
        <Empty description="购物车为空" />
      ) : (
        <Space vertical spacing={16} style={{ width: '100%' }}>
          <div className="max-h-96 overflow-y-auto">
            {cart.map((item) => (
              <div
                key={item.product_id}
                className="flex justify-between items-center p-3 border-b border-gray-200"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 m-0 mb-1">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-red-600 font-semibold m-0">
                    ¥{item.price}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <InputNumber
                    value={item.quantity}
                    min={1}
                    max={999}
                    step={1}
                    size="small"
                    className="w-24"
                    onChange={(value) => {
                      const newQuantity = typeof value === 'number' ? value : 1;
                      onUpdateQuantity(item.product_id, newQuantity);
                    }}
                  />
                  <Button
                    type="danger"
                    size="small"
                    onClick={() => onRemove(item.product_id)}
                  >
                    移除
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
              <span>总价格:</span>
              <span className="text-2xl text-red-600">
                ¥{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
          <Button block type="primary" size="large" onClick={handleCheckout}>
            去结算
          </Button>
        </Space>
      )}
    </Modal>
  );
};

export default CartModal;