import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Toast, Space, Tag } from '@douyinfe/semi-ui';
import { IconPlus, IconEdit, IconDelete } from '@douyinfe/semi-icons';

interface Product {
  product_id: number;
  category_id: number;
  product_name: string;
  product_img?: string;
  price: number;
  stock: number;
  description?: string;
  status: number;
  created_at: string;
  updated_at: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categoryOptions = [
    { label: '电子', value: 1 },
    { label: '衣服', value: 2 },
    { label: '食物', value: 3 },
    { label: '鞋子', value: 4 }
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      } else {
        Toast.error(result.message);
      }
    } catch (error) {
      Toast.error('获取商品列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleDelete = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        Toast.success('商品删除成功');
        fetchProducts();
      } else {
        Toast.error(result.message);
      }
    } catch (error) {
      Toast.error('删除商品失败');
    }
  };

  const handleStatusChange = async (productId: number, status: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (result.success) {
        Toast.success(result.message);
        fetchProducts();
      } else {
        Toast.error(result.message);
      }
    } catch (error) {
      Toast.error('操作失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingProduct
        ? `http://localhost:3000/api/products/${editingProduct.product_id}`
        : 'http://localhost:3000/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      const result = await response.json();
      if (result.success) {
        Toast.success(editingProduct ? '商品更新成功' : '商品添加成功');
        setModalVisible(false);
        fetchProducts();
      } else {
        Toast.error(result.message);
      }
    } catch (error) {
      Toast.error(editingProduct ? '更新商品失败' : '添加商品失败');
    }
  };

  const columns = [
    {
      title: '商品ID',
      dataIndex: 'product_id',
      width: 80
    },
    {
      title: '商品名称',
      dataIndex: 'product_name',
      width: 200
    },
    {
      title: '分类',
      dataIndex: 'category_id',
      render: (categoryId: number) => {
        const category = categoryOptions.find(c => c.value === categoryId);
        return category?.label || '未知';
      },
      width: 100
    },
    {
      title: '价格',
      dataIndex: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
      width: 100
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '上架' : '下架'}
        </Tag>
      ),
      width: 80
    },
    {
      title: '操作',
      render: (record: Product) => (
        <Space>
          <Button
            type="tertiary"
            size="small"
            onClick={() => handleStatusChange(record.product_id, record.status === 1 ? 0 : 1)}
          >
            {record.status === 1 ? '下架' : '上架'}
          </Button>
          <Button
            type="tertiary"
            size="small"
            icon={<IconEdit />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="danger"
            size="small"
            icon={<IconDelete />}
            onClick={() => handleDelete(record.product_id)}
          >
            删除
          </Button>
        </Space>
      ),
      width: 200
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>商品管理</h2>
        <Button type="primary" icon={<IconPlus />} onClick={handleAdd}>
          添加商品
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true
        }}
      />

      <Modal
        title={editingProduct ? '编辑商品' : '添加商品'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          onSubmit={handleSubmit}
          initValues={editingProduct || {}}
        >
          <Form.Select
            field="category_id"
            label="商品分类"
            placeholder="请选择商品分类"
            rules={[{ required: true, message: '请选择商品分类' }]}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {categoryOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Form.Select>

          <Form.Input
            field="product_name"
            label="商品名称"
            placeholder="请输入商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
            style={{ marginBottom: '16px' }}
          />

          <Form.Input
            field="product_img"
            label="商品图片"
            placeholder="请输入商品图片URL"
            style={{ marginBottom: '16px' }}
          />

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <Form.InputNumber
              field="price"
              label="价格"
              placeholder="请输入价格"
              min={0}
              precision={2}
              rules={[{ required: true, message: '请输入价格' }]}
              style={{ flex: 1 }}
            />

            <Form.InputNumber
              field="stock"
              label="库存"
              placeholder="请输入库存数量"
              min={0}
              rules={[{ required: true, message: '请输入库存数量' }]}
              style={{ flex: 1 }}
            />
          </div>

          <Form.TextArea
            field="description"
            label="商品描述"
            placeholder="请输入商品描述"
            rows={4}
            style={{ marginBottom: '24px' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              {editingProduct ? '更新' : '添加'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;