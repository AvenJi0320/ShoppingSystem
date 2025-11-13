import { Card, Button } from '@douyinfe/semi-ui';
import { IconComment } from '@douyinfe/semi-icons';
import { useState } from 'react';
import ProductCommentModal from './ProductCommentModal';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  const handleCommentClick = () => {
    setCommentModalVisible(true);
  };

  const handleCommentModalClose = () => {
    setCommentModalVisible(false);
  };

  return (
    <>
      <Card
      key={product.product_id}
      title={product.product_name}
      cover={
        <div className="w-64 h-64 mx-auto overflow-hidden flex items-center justify-center bg-gray-200">
          <img
            src={product.product_img}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
        </div>
      }
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <p className="text-sm text-gray-600 line-clamp-1 mb-3">
            {product.description}
          </p>
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold text-red-600 m-0">
              ¥{product.price}
            </p>
            <p className="text-xs text-gray-400 m-0">库存: {product.stock}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            type="secondary"
            icon={<IconComment />}
            onClick={handleCommentClick}
            className="flex-1"
          />
          <Button
            block
            type="primary"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="flex-1"
          >
            {product.stock === 0 ? '缺货' : '加入购物车'}
          </Button>
        </div>
      </div>
    </Card>
    <ProductCommentModal
      visible={commentModalVisible}
      onClose={handleCommentModalClose}
      productId={product.product_id}
    />
    </>
  );
};

export default ProductCard;