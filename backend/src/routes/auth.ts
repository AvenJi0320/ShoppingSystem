import { Elysia } from 'elysia';
import prisma from '../db/client.js';

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .post('/register', async ({ body }) => {
    try {
      const { phone, email, password } = body as { phone: string; email?: string; password: string };
      
      // 验证必填字段
      if (!phone || !password) {
        return {
          success: false,
          message: '手机号和密码不能为空',
          timestamp: new Date().toISOString()
        };
      }

      // 验证手机号格式
      const isPhone = /^\d{11}$/.test(phone);
      if (!isPhone) {
        return {
          success: false,
          message: '请输入有效的手机号',
          timestamp: new Date().toISOString()
        };
      }

      // 验证邮箱格式（如果提供）
      if (email) {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isEmail) {
          return {
            success: false,
            message: '请输入有效的邮箱地址',
            timestamp: new Date().toISOString()
          };
        }
      }

      // 检查手机号是否已存在
      const existingUserByPhone = await prisma.sysUser.findUnique({
        where: { phone }
      });

      if (existingUserByPhone) {
        return {
          success: false,
          message: '手机号已被注册',
          timestamp: new Date().toISOString()
        };
      }

      // 检查邮箱是否已存在（如果提供）
      if (email) {
        const existingUserByEmail = await prisma.sysUser.findUnique({
          where: { email }
        });

        if (existingUserByEmail) {
          return {
            success: false,
            message: '邮箱已被注册',
            timestamp: new Date().toISOString()
          };
        }
      }

      // 创建新用户
      const newUser = await prisma.sysUser.create({
        data: {
          phone,
          email,
          password // 注意：实际项目中应该加密密码
        }
      });

      return {
        success: true,
        message: '注册成功',
        data: {
          user_id: newUser.user_id,
          phone: newUser.phone,
          email: newUser.email
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
  })
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