import { Elysia } from 'elysia';
import prisma from '../db/client.js';

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .post('/login', async ({ body }) => {
    try {
      const { identifier, password } = body as { identifier: string; password: string };
      
      // 根据输入格式判断是手机号还是邮箱
      const isPhone = /^\d{11}$/.test(identifier);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      
      if (!isPhone && !isEmail) {
        return {
          success: false,
          message: '请输入有效的手机号或邮箱地址',
          timestamp: new Date().toISOString()
        };
      }

      // 查找用户
      const user = await prisma.sysUser.findFirst({
        where: isPhone ? { phone: identifier } : { email: identifier }
      });

      if (!user) {
        return {
          success: false,
          message: '用户不存在',
          timestamp: new Date().toISOString()
        };
      }

      // 验证密码（这里假设密码是明文存储，实际项目中应该加密）
      if (user.password !== password) {
        return {
          success: false,
          message: '密码错误',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: '登录成功',
        data: {
          user_id: user.user_id,
          phone: user.phone,
          email: user.email
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        message: '服务器错误',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  });