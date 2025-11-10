import { Elysia } from 'elysia';
import prisma from '../db/client.js';

export const orderRoutes = new Elysia({ prefix: '/api/order/user' })
  .get('/:user_id', async ({ params }) => {
    try {
      const { user_id } = params as { user_id: string };
      const userId = parseInt(user_id);

      if (isNaN(userId)) {
        return {
          success: false,
          message: '无效的用户ID',
          timestamp: new Date().toISOString()
        };
      }

      // 检查用户是否存在
      const user = await prisma.sysUser.findUnique({
        where: { user_id: userId }
      });

      if (!user) {
        return {
          success: false,
          message: '用户不存在',
          data: [],
          timestamp: new Date().toISOString()
        };
      }

      // 获取用户的所有订单
      const orders = await prisma.order.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
      });
      console.log(orders);

      // 将 BigInt 转换为字符串以支持 JSON 序列化
      const ordersFormatted = orders.map(order => ({
        ...order,
        order_id: order.order_id.toString()
      }));

      return {
        success: true,
        message: '订单列表获取成功',
        data: ordersFormatted,
        metadata: {
          totalCount: orders.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Order fetch error:', error);
      return {
        success: false,
        message: '服务器错误',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  });