import { useState } from 'react';
import { Layout, Nav, Button, Avatar } from '@douyinfe/semi-ui';
import { IconShoppingBag, IconGift, IconExit } from '@douyinfe/semi-icons';
import ProductManagement from './ProductManagement';
import PromotionManagement from './PromotionManagement';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

const { Header, Sider, Content } = Layout;

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();
  const clearUser = useUserStore((state) => state.clearUser);

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement />;
      case 'promotions':
        return <PromotionManagement />;
      default:
        return <ProductManagement />;
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e8e8e8',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{ margin: 0, color: '#1f2937' }}>管理员面板</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar size="small" color="orange">管</Avatar>
          <span>管理员</span>
          <Button
            type="tertiary"
            icon={<IconExit />}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </div>
      </Header>

      <Layout>
        <Sider style={{ backgroundColor: '#fff', borderRight: '1px solid #e8e8e8' }}>
          <Nav
            selectedKeys={[activeTab]}
            onSelect={(data) => setActiveTab(data.itemKey as string)}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Nav.Item
              itemKey="products"
              icon={<IconShoppingBag />}
              text="商品管理"
            />
            <Nav.Item
              itemKey="promotions"
              icon={<IconGift />}
              text="促销活动"
            />
          </Nav>
        </Sider>

        <Content style={{
          padding: 0,
          backgroundColor: '#f8fafc',
          overflow: 'auto'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPanel;