import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Toast } from '@douyinfe/semi-ui';
import { useUserStore } from '../../store/userStore';

const Login = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (values: any) => {
    if (isRegister) {
      const { phone, email, password, confirmPassword } = values;

      const trimmedPhone = phone.trim();
      const trimmedEmail = email ? email.trim() : '';
      const trimmedPassword = password.trim();
      const trimmedConfirmPassword = confirmPassword.trim();

      // 基础验证
      if (!trimmedPhone || !trimmedPassword || !trimmedConfirmPassword) {
        Toast.error('请输入手机号、密码和确认密码');
        return;
      }

      if (trimmedPassword !== trimmedConfirmPassword) {
        Toast.error('密码和确认密码不一致');
        return;
      }

      // 格式验证
      const isPhone = /^\d{11}$/.test(trimmedPhone);
      if (!isPhone) {
        Toast.error('请输入有效的手机号');
        return;
      }

      if (trimmedEmail) {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
        if (!isEmail) {
          Toast.error('请输入有效的邮箱地址');
          return;
        }
      }

      try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: trimmedPhone,
            email: trimmedEmail || undefined,
            password: trimmedPassword
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          Toast.success('注册成功，请登录');
          setIsRegister(false);
        } else {
          Toast.error(result.message);
        }
      } catch (error) {
        console.error('注册错误:', error);
        Toast.error('网络错误，请稍后重试');
      }
    } else {
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
          // 保存用户信息到store
          setUser(result.data.user_id, result.data.phone, result.data.email);
          Toast.success('登录成功');
          navigate('/shop');
        } else {
          Toast.error(result.message);
        }
      } catch (error) {
        console.error('登录错误:', error);
        Toast.error('网络错误，请稍后重试');
      }
    }
  };

  return (
    <div style={{
      minWidth: '550px',
      margin: '20px auto',
      padding: '40px 32px',
      border: '1px solid #e1e5e9',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#ffffff',
      backdropFilter: 'blur(10px)'
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '32px',
        color: '#1f2937',
        fontSize: '32px',
        fontWeight: '700',
        letterSpacing: '-0.025em'
      }}>
        {isRegister ? '创建账号' : '欢迎回来'}
      </h1>
      <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {isRegister ? (
          <>
            <Form.Input
              field="phone"
              label="手机号"
              placeholder="请输入11位手机号"
              rules={[
                { required: true, message: '请输入手机号' }
              ]}
              style={{
                marginBottom: '20px',
                borderRadius: '8px',
                border: '1px solid #d1d5db'
              }}
            />
            <Form.Input
              field="email"
              label="邮箱（可选）"
              placeholder="请输入邮箱地址"
              style={{
                marginBottom: '20px',
                borderRadius: '8px',
                border: '1px solid #d1d5db'
              }}
            />
            <Form.Input
              field="password"
              label="密码"
              placeholder="请输入6位以上密码"
              type="password"
              rules={[
                { required: true, message: '请输入密码' }
              ]}
              style={{
                marginBottom: '20px',
                borderRadius: '8px',
                border: '1px solid #d1d5db'
              }}
            />
            <Form.Input
              field="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              type="password"
              rules={[
                { required: true, message: '请确认密码' }
              ]}
              style={{
                marginBottom: '28px',
                borderRadius: '8px',
                border: '1px solid #d1d5db'
              }}
            />
          </>
        ) : (
          <>
            <Form.Input
              field="identifier"
              label="手机号或邮箱"
              placeholder="请输入手机号或邮箱"
              rules={[
                { required: true, message: '请输入手机号或邮箱' }
              ]}
              style={{
                marginBottom: '20px',
                borderRadius: '8px',
                border: '1px solid #d1d5db'
              }}
            />
            <Form.Input
              field="password"
              label="密码"
              placeholder="请输入密码"
              type="password"
              rules={[
                { required: true, message: '请输入密码' }
              ]}
              style={{
                marginBottom: '28px',
                borderRadius: '8px',
                border: '1px solid #d1d5db'
              }}
            />
          </>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              height: '52px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease'
            }}
            theme="solid"
          >
            {isRegister ? '立即注册' : '登录'}
          </Button>
          <Button
            type="tertiary"
            onClick={() => setIsRegister(!isRegister)}
            style={{
              height: '48px',
              fontSize: '15px',
              borderRadius: '10px',
              color: '#6b7280',
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease'
            }}
          >
            {isRegister ? '已有账号？立即登录' : '没有账号？立即注册'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Login;