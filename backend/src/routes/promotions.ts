import { Elysia } from 'elysia';
import prisma from '../db/client.js';

export const promotionRoutes = new Elysia({ prefix: '/api/promotions' })
  // 获取当前可用的促销活动
  .get('/available', async () => {
    try {
      const now = new Date();

      const promotions = await prisma.promotion.findMany({
        where: {
          status: 1, // 进行中的活动
          start_time: { lte: now },
          end_time: { gte: now }
        },
        include: {
          rules: {
            include: {
              product: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      return {
        success: true,
        data: promotions,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '获取可用促销活动失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })
  // 获取所有促销活动
  .get('/', async ({ query }) => {
    try {
      const { page = 1, limit = 10, status, type } = query as any;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where: any = {};
      if (status !== undefined) where.status = parseInt(status);
      if (type) where.type = parseInt(type);

      const [promotions, total] = await Promise.all([
        prisma.promotion.findMany({
          where,
          include: {
            rules: {
              include: {
                product: true
              }
            },
            creator: {
              select: {
                user_id: true,
                phone: true,
                email: true
              }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { created_at: 'desc' }
        }),
        prisma.promotion.count({ where })
      ]);

      return {
        success: true,
        data: promotions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '获取促销活动列表失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })

  // 获取单个促销活动
  .get('/:id', async ({ params }) => {
    try {
      const promotion = await prisma.promotion.findUnique({
        where: { promotion_id: parseInt(params.id) },
        include: {
          rules: {
            include: {
              product: true
            }
          },
          creator: {
            select: {
              user_id: true,
              phone: true,
              email: true
            }
          }
        }
      });

      if (!promotion) {
        return {
          success: false,
          message: '促销活动不存在',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: promotion,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '获取促销活动详情失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })

  // 创建促销活动
  .post('/', async ({ body }) => {
    try {
      const { title, description, type, start_time, end_time, created_by, rules } = body as any;

      const promotion = await prisma.promotion.create({
        data: {
          title,
          description,
          type: parseInt(type),
          start_time: new Date(start_time),
          end_time: new Date(end_time),
          created_by: parseInt(created_by),
          rules: {
            create: rules.map((rule: any) => ({
              product_id: rule.product_id ? parseInt(rule.product_id) : null,
              condition_type: parseInt(rule.condition_type),
              condition_value: parseFloat(rule.condition_value),
              discount_type: parseInt(rule.discount_type),
              discount_value: parseFloat(rule.discount_value),
              gift_product_id: rule.gift_product_id ? parseInt(rule.gift_product_id) : null
            }))
          }
        },
        include: {
          rules: {
            include: {
              product: true
            }
          }
        }
      });

      return {
        success: true,
        message: '促销活动创建成功',
        data: promotion,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '创建促销活动失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })

  // 更新促销活动
  .put('/:id', async ({ params, body }) => {
    try {
      const { title, description, type, start_time, end_time, status, rules } = body as any;

      // 先删除现有的规则
      await prisma.promotionRule.deleteMany({
        where: { promotion_id: parseInt(params.id) }
      });

      // 更新活动并创建新规则
      const promotion = await prisma.promotion.update({
        where: { promotion_id: parseInt(params.id) },
        data: {
          title,
          description,
          type: type ? parseInt(type) : undefined,
          start_time: start_time ? new Date(start_time) : undefined,
          end_time: end_time ? new Date(end_time) : undefined,
          status: status !== undefined ? parseInt(status) : undefined,
          rules: rules ? {
            create: rules.map((rule: any) => ({
              product_id: rule.product_id ? parseInt(rule.product_id) : null,
              condition_type: parseInt(rule.condition_type),
              condition_value: parseFloat(rule.condition_value),
              discount_type: parseInt(rule.discount_type),
              discount_value: parseFloat(rule.discount_value),
              gift_product_id: rule.gift_product_id ? parseInt(rule.gift_product_id) : null
            }))
          } : undefined
        },
        include: {
          rules: {
            include: {
              product: true
            }
          }
        }
      });

      return {
        success: true,
        message: '促销活动更新成功',
        data: promotion,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '更新促销活动失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })

  // 删除促销活动
  .delete('/:id', async ({ params }) => {
    try {
      await prisma.promotion.delete({
        where: { promotion_id: parseInt(params.id) }
      });

      return {
        success: true,
        message: '促销活动删除成功',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '删除促销活动失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })

  // 更新促销活动状态
  .patch('/:id/status', async ({ params, body }) => {
    try {
      const { status } = body as any;

      const promotion = await prisma.promotion.update({
        where: { promotion_id: parseInt(params.id) },
        data: { status: parseInt(status) }
      });

      return {
        success: true,
        message: '促销活动状态更新成功',
        data: promotion,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '更新状态失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  });