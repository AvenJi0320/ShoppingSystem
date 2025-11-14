import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Toast, Space, Tag, Card } from '@douyinfe/semi-ui';
import { IconPlus, IconEdit, IconDelete, IconPlay, IconPause } from '@douyinfe/semi-icons';

interface Promotion {
  promotion_id: number;
  title: string;
  description?: string;
  type: number;
  status: number;
  start_time: string;
  end_time: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  rules: PromotionRule[];
  creator: {
    user_id: number;
    phone: string;
    email?: string;
  };
}

interface PromotionRule {
  rule_id: number;
  promotion_id: number;
  product_id?: number;
  condition_type: number;
  condition_value: number;
  discount_type: number;
  discount_value: number;
  gift_product_id?: number;
  product?: {
    product_id: number;
    product_name: string;
  };
}

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [rules, setRules] = useState<PromotionRule[]>([]);

  const typeOptions = [
    { label: '满减', value: 1 },
    { label: '折扣', value: 2 },
    { label: '赠品', value: 3 },
    { label: '限时折扣', value: 4 }
  ];

  const conditionTypeOptions = [
    { label: '满金额', value: 1 },
    { label: '满数量', value: 2 }
  ];

  const discountTypeOptions = [
    { label: '减金额', value: 1 },
    { label: '打折', value: 2 },
    { label: '赠品', value: 3 }
  ];

  const statusOptions = [
    { label: '未开始', value: 0 },
    { label: '进行中', value: 1 },
    { label: '已结束', value: 2 }
  ];

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/promotions');
      const result = await response.json();
      if (result.success) {
        setPromotions(result.data);
      } else {
        Toast.error(result.message);
      }
    } catch (error) {
      Toast.error('获取促销活动列表失败');
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('获取商品列表失败');
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setEditingPromotion(null);
    setRules([{ rule_id: 0, promotion_id: 0, condition_type: 1, condition_value: 0, discount_type: 1, discount_value: 0 }]);
    setModalVisible(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setRules(promotion.rules.length > 0 ? promotion.rules : [{ rule_id: 0, promotion_id: 0, condition_type: 1, condition_value: 0, discount_type: 1, discount_value: 0 }]);
    setModalVisible(true);
  };

  const handleDelete = async (promotionId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/promotions/${promotionId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        Toast.success('促销活动删除成功');
        fetchPromotions();
      } else {
        Toast.error(result.message);
      }
    } catch (error) {
      Toast.error('删除促销活动失败');
    }
  };

  const handleStatusChange = async (promotionId: number, status: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/promotions/${promotionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (result.success) {
        Toast.success('状态更新成功');
        fetchPromotions();
      } else {
        Toast.error(result.message);
      }
    } catch (error) {
      Toast.error('更新状态失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const promotionData = {
        ...values,
        created_by: 1, // 暂时使用管理员ID 1
        rules: rules.filter(rule => rule.condition_value > 0 && rule.discount_value > 0)
      };

      const url = editingPromotion
        ? `http://localhost:3000/api/promotions/${editingPromotion.promotion_id}`
        : 'http://localhost:3000/api/promotions';
      const method = editingPromotion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promotionData)
      });

      const result = await response.json();
      if (result.success) {
        Toast.success(editingPromotion ? '促销活动更新成功' : '促销活动创建成功');
        setModalVisible(false);
        fetchPromotions();
      } else {
        Toast.error(result.message);
      }
    } catch (error) {
      Toast.error(editingPromotion ? '更新促销活动失败' : '创建促销活动失败');
    }
  };

  const addRule = () => {
    setRules([...rules, { 
      rule_id: Date.now(), // 使用时间戳作为临时ID
      promotion_id: 0, 
      condition_type: 1, 
      condition_value: 0, 
      discount_type: 1, 
      discount_value: 0 
    }]);
  };

  const updateRule = (index: number, field: string, value: any) => {
    const newRules = [...rules];
    const updatedRule = { ...newRules[index], [field]: value } as PromotionRule;
    newRules[index] = updatedRule;
    setRules(newRules);
  };

  const removeRule = (index: number) => {
    if (rules.length > 1) {
      setRules(rules.filter((_, i) => i !== index));
    }
  };

  const columns = [
    {
      title: '活动ID',
      dataIndex: 'promotion_id',
      width: 80
    },
    {
      title: '活动标题',
      dataIndex: 'title',
      width: 200
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (type: number) => {
        const typeOption = typeOptions.find(t => t.value === type);
        return typeOption?.label || '未知';
      },
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: number) => {
        const colors: Record<number, any> = { 0: 'orange', 1: 'green', 2: 'red' };
        const statusOption = statusOptions.find(s => s.value === status);
        return <Tag color={colors[status]}>{statusOption?.label}</Tag>;
      },
      width: 100
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      render: (time: string) => new Date(time).toLocaleString(),
      width: 150
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      render: (time: string) => new Date(time).toLocaleString(),
      width: 150
    },
    {
      title: '操作',
      render: (record: Promotion) => (
        <Space>
          <Button
            type="tertiary"
            size="small"
            icon={record.status === 1 ? <IconPause /> : <IconPlay />}
            onClick={() => handleStatusChange(record.promotion_id, record.status === 1 ? 2 : 1)}
          >
            {record.status === 1 ? '暂停' : '开始'}
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
            onClick={() => handleDelete(record.promotion_id)}
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
        <h2>促销活动管理</h2>
        <Button type="primary" icon={<IconPlus />} onClick={handleAdd}>
          创建活动
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={promotions}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true
        }}
      />

      <Modal
        title={editingPromotion ? '编辑促销活动' : '创建促销活动'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: '20px' }}
      >
        <Form
          onSubmit={handleSubmit}
          initValues={editingPromotion || {}}
        >
          <Form.Input
            field="title"
            label="活动标题"
            placeholder="请输入活动标题"
            rules={[{ required: true, message: '请输入活动标题' }]}
            style={{ marginBottom: '16px' }}
          />

          <Form.TextArea
            field="description"
            label="活动描述"
            placeholder="请输入活动描述"
            rows={3}
            style={{ marginBottom: '16px' }}
          />

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <Form.Select
              field="type"
              label="活动类型"
              placeholder="请选择活动类型"
              rules={[{ required: true, message: '请选择活动类型' }]}
              style={{ flex: 1 }}
            >
              {typeOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Form.Select>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <Form.DatePicker
              field="start_time"
              label="开始时间"
              type="dateTime"
              placeholder="选择开始时间"
              rules={[{ required: true, message: '请选择开始时间' }]}
              style={{ flex: 1 }}
            />
            <Form.DatePicker
              field="end_time"
              label="结束时间"
              type="dateTime"
              placeholder="选择结束时间"
              rules={[{ required: true, message: '请选择结束时间' }]}
              style={{ flex: 1 }}
            />
          </div>

          <Card title="促销规则" style={{ marginBottom: '24px' }}>
            {rules.map((rule, index) => (
              <div key={index} style={{ marginBottom: index < rules.length - 1 ? '20px' : 0, padding: '16px', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <Select
                    placeholder="条件类型"
                    value={rule.condition_type}
                    onChange={(value) => updateRule(index, 'condition_type', value)}
                    style={{ width: '120px' }}
                  >
                    {conditionTypeOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>

                  <Input
                    placeholder="条件值"
                    type="number"
                    value={rule.condition_value}
                    onChange={(value) => updateRule(index, 'condition_value', parseFloat(value))}
                    style={{ width: '120px' }}
                  />

                  <Select
                    placeholder="优惠类型"
                    value={rule.discount_type}
                    onChange={(value) => updateRule(index, 'discount_type', value)}
                    style={{ width: '120px' }}
                  >
                    {discountTypeOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>

                  <Input
                    placeholder="优惠值"
                    type="number"
                    value={rule.discount_value}
                    onChange={(value) => updateRule(index, 'discount_value', parseFloat(value))}
                    style={{ width: '120px' }}
                  />

                  <Select
                    placeholder="指定商品（可选）"
                    value={rule.product_id}
                    onChange={(value) => updateRule(index, 'product_id', value)}
                    style={{ flex: 1 }}
                  >
                    {products.map(product => (
                      <Select.Option key={product.product_id} value={product.product_id}>
                        {product.product_name}
                      </Select.Option>
                    ))}
                  </Select>

                  {rules.length > 1 && (
                    <Button type="danger" onClick={() => removeRule(index)}>
                      删除
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button onClick={addRule} style={{ width: '100%' }}>
              添加规则
            </Button>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              {editingPromotion ? '更新' : '创建'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionManagement;