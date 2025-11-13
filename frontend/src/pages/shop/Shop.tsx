import { useState, useEffect } from 'react';
import { Button, Spin, Empty } from '@douyinfe/semi-ui';
import { ProductCard, CartModal, TopNavBar, ProductFilter } from './components';
import type {Product} from './types';
import { useCartStore } from '../../store/cartStore';

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartVisible, setCartVisible] = useState(false);
  const [filters, setFilters] = useState({ searchTerm: '', category: '' });

  const { cart, addToCart, removeFromCart, updateQuantity } = useCartStore();

  // 获取商品列表
  useEffect(() => {
    void fetchProducts();
  }, []);

  // 当过滤器改变时，重新过滤商品
  useEffect(() => {
    filterProducts();
  }, [filters, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/products');
      const result = await response.json();
      if (result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤商品函数
  const filterProducts = () => {
    let filtered = products;

    // 按商品名称搜索
    if (filters.searchTerm) {
      filtered = filtered.filter(product => 
        (product.product_name || '')
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      );
    }

    // 按商品类型过滤 - 使用category_id字段
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category_id === parseInt(filters.category)
      );
    }

    setFilteredProducts(filtered);
  };

  // 处理过滤器变化
  const handleFilterChange = (newFilters: { searchTerm: string; category: string }) => {
    setFilters(newFilters);
  };

  // 处理搜索
  const handleSearch = (searchTerm: string, category: string) => {
    setFilters({ searchTerm, category });
  };

  // 添加商品到购物车
  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  // 移除购物车商品
  const handleRemoveFromCart = (productId: number) => {
    removeFromCart(productId);
  };

  // 更新购物车商品数量
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* 顶部主导航栏 */}
      <TopNavBar />

      {/* 商品列表导航栏 */}
      <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-lg shadow-sm m-5">
        <h1 className="text-3xl font-bold text-gray-900 m-0">商品列表</h1>
        <Button
          type="primary"
          onClick={() => setCartVisible(true)}
        >
          购物车 ({cart.length})
        </Button>
      </div>

      {/* 商品过滤组件 */}
      <div className="mx-5">
        <ProductFilter 
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />
      </div>

      {/* 商品展示区域 */}
      <div className="w-full">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Spin />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Empty 
              description={
                filters.searchTerm || filters.category 
                  ? '没有找到符合条件的商品' 
                  : '暂无商品'
              }
            />
            {(filters.searchTerm || filters.category) && (
              <Button 
                type="secondary" 
                onClick={() => handleSearch('', '')}
                className="mt-4"
              >
                清除筛选条件
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* 购物车模态框 */}
      <CartModal
        visible={cartVisible}
        cart={cart}
        onCancel={() => setCartVisible(false)}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
};

export default Shop;