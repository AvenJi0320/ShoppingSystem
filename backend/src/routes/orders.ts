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

      // 订单数据格式化（order_id 已经是 number 类型）
      const ordersFormatted = orders.map(order => ({
        ...order,
        order_id: order.order_id
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
  })
  .post('/create', async ({ body }) => {
    try {
      const { user_id, total_amount, product_list } = body as {
        user_id: number;
        total_amount: number;
        product_list: number[];
      };

      // 验证必要参数
      if (!user_id || !total_amount || !product_list || !Array.isArray(product_list)) {
        return {
          success: false,
          message: '缺少必要参数：user_id, total_amount, product_list',
          timestamp: new Date().toISOString()
        };
      }

      // 检查用户是否存在
      const user = await prisma.sysUser.findUnique({
        where: { user_id: user_id }
      });

      if (!user) {
        return {
          success: false,
          message: '用户不存在',
          timestamp: new Date().toISOString()
        };
      }

      // 验证商品是否存在且库存充足
      const productIds = product_list;
      const products = await prisma.product.findMany({
        where: {
          product_id: { in: productIds },
          status: 1 // 只查询上架的商品
        }
      });

      if (products.length !== productIds.length) {
        return {
          success: false,
          message: '部分商品不存在或已下架',
          timestamp: new Date().toISOString()
        };
      }

      // 检查库存
      for (const product of products) {
        if (product.stock <= 0) {
          return {
            success: false,
            message: `商品 ${product.product_name} 库存不足`,
            timestamp: new Date().toISOString()
          };
        }
      }

      // 将商品ID数组转换为字符串
      const productListStr = product_list.join(',');

      // 创建订单
      const order = await prisma.order.create({
        data: {
          user_id: user_id,
          total_amount: total_amount,
          product_list: productListStr,
          order_status: 0 // 默认状态：待收货
        }
      });

      // 减少商品库存
      for (const productId of productIds) {
        await prisma.product.update({
          where: { product_id: productId },
          data: {
            stock: { decrement: 1 }
          }
        });
      }

      return {
        success: true,
        message: '订单创建成功',
        data: {
          order_id: order.order_id,
          user_id: order.user_id,
          total_amount: order.total_amount,
          product_list: order.product_list,
          order_status: order.order_status,
          created_at: order.created_at
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Order creation error:', error);
      return {
        success: false,
        message: '创建订单失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })
  .put('/update-status', async ({ body }) => {
    try {
      const { order_id, order_status } = body as {
        order_id: string;
        order_status: number;
      };

      // 验证必要参数
      if (!order_id || order_status === undefined) {
        return {
          success: false,
          message: '缺少必要参数：order_id, order_status',
          timestamp: new Date().toISOString()
        };
      }

      // 验证订单状态值是否有效
      if (![0, 1, 2].includes(order_status)) {
        return {
          success: false,
          message: '无效的订单状态，只能为 0-待收货, 1-已完成, 2-已取消',
          timestamp: new Date().toISOString()
        };
      }

      // 将字符串订单ID转换为number
      const orderIdNumber = parseInt(order_id);

      // 检查订单是否存在
      const existingOrder = await prisma.order.findUnique({
        where: { order_id: orderIdNumber }
      });

      if (!existingOrder) {
        return {
          success: false,
          message: '订单不存在',
          timestamp: new Date().toISOString()
        };
      }

      // 更新订单状态
      const updatedOrder = await prisma.order.update({
        where: { order_id: orderIdNumber },
        data: { order_status: order_status }
      });

      return {
        success: true,
        message: '订单状态更新成功',
        data: {
          order_id: updatedOrder.order_id.toString(),
          user_id: updatedOrder.user_id,
          order_status: updatedOrder.order_status,
          updated_at: updatedOrder.updated_at
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Order status update error:', error);
      return {
        success: false,
        message: '更新订单状态失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  });