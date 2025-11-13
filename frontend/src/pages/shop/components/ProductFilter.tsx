import React, { useState } from 'react';
import { Input, Select, Button, Space } from '@douyinfe/semi-ui';

interface ProductFilterProps {
  onFilterChange: (filters: FilterState) => void;
  onSearch: (searchTerm: string, category: string) => void;
}

interface FilterState {
  searchTerm: string;
  category: string;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ onFilterChange, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  // 商品类型选项 - 根据category_id映射: 1:电子, 2:衣服, 3:食物, 4:鞋子
  const categoryOptions = [
    { value: '', label: '全部分类' },
    { value: '1', label: '电子' },
    { value: '2', label: '衣服' },
    { value: '3', label: '食物' },
    { value: '4', label: '鞋子' }
  ];

  const handleSearch = () => {
    onSearch(searchTerm, category);
  };

  const handleReset = () => {
    setSearchTerm('');
    setCategory('');
    onFilterChange({ searchTerm: '', category: '' });
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange({ searchTerm: value, category });
  };

  const handleCategoryChange = (value: string | number | any[] | Record<string, any> | undefined) => {
    const categoryValue = typeof value === 'string' ? value : '';
    setCategory(categoryValue);
    onFilterChange({ searchTerm, category: categoryValue });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 min-w-0">
          <Input
            placeholder="搜索商品名称..."
            value={searchTerm}
            onChange={handleSearchTermChange}
            prefix="🔍"
            className="w-full"
            onEnterPress={handleSearch}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            placeholder="选择商品类型"
            value={category}
            onChange={handleCategoryChange}
            className="w-full"
          >
            {categoryOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        
        <Space>
          <Button 
            type="primary" 
            onClick={handleSearch}
            icon="搜索"
          >
            搜索
          </Button>
          <Button 
            type="secondary" 
            onClick={handleReset}
            icon="重置"
          >
            重置
          </Button>
        </Space>
      </div>
      
      {/* 当前筛选条件显示 */}
      {(searchTerm || category) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            当前筛选: 
            {searchTerm && <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">名称: {searchTerm}</span>}
            {category && (
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
                分类: {categoryOptions.find(opt => opt.value === category)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;