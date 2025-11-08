import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Toast } from '@douyinfe/semi-ui';

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    const { identifier, password } = values;
    
    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();
    
    // 基础验证
    if (!trimmedIdentifier || !trimmedPassword) {
      Toast.error('请输入手机号/邮箱和密码');
      return;
    }
    
    // 格式验证
    const isPhone = /^\d{11}$/.test(trimmedIdentifier);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier);
    
    if (!isPhone && !isEmail) {
      Toast.error('请输入有效的手机号或邮箱地址');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: trimmedIdentifier,
          password: trimmedPassword
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        Toast.success('登录成功');
        navigate('/shop');
      } else {
        Toast.error(result.message);
      }
    } catch (error) {
      console.error('登录错误:', error);
      Toast.error('网络错误，请稍后重试');
    }
  };

  return (
    <div>
      <h1>登录</h1>
      <Form onSubmit={handleSubmit} initValues={{ identifier: '', password: '' }}>
        <Form.Input
          field="identifier"
          label="手机号或邮箱"
          placeholder="请输入手机号或邮箱"
          rules={[
            { required: true, message: '请输入手机号或邮箱' }
          ]}
        />
        <Form.Input
          field="password"
          label="密码"
          placeholder="请输入密码"
          type="password"
          rules={[
            { required: true, message: '请输入密码' }
          ]}
        />
        <Button type="primary" htmlType="submit">登录</Button>
      </Form>
    </div>
  );
};

export default Login;