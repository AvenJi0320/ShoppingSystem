import { Elysia } from 'elysia';
import prisma from '../db/client.js';

export const productRoutes = new Elysia({ prefix: '/api/products' })
  // 获取所有商品（支持分页、筛选）
  .get('/', async ({ query }) => {
    try {
      const { page = 1, limit = 10, category, status, search } = query as any;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where: any = {};
      if (category) where.category_id = parseInt(category);
      if (status !== undefined) where.status = parseInt(status);
      if (search) {
        where.product_name = {
          contains: search,
          mode: 'insensitive'
        };
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { created_at: 'desc' }
        }),
        prisma.product.count({ where })
      ]);

      return {
        success: true,
        data: products,
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
        message: '获取商品列表失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })

  // 获取单个商品
  .get('/:id', async ({ params }) => {
    try {
      const product = await prisma.product.findUnique({
        where: { product_id: parseInt(params.id) }
      });

      if (!product) {
        return {
          success: false,
          message: '商品不存在',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: product,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '获取商品详情失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })

  // 添加商品（管理员）
  .post('/', async ({ body }) => {
    try {
      const { category_id, product_name, product_img, price, stock, description } = body as any;

      const product = await prisma.product.create({
        data: {
          category_id: parseInt(category_id),
          product_name,
          product_img,
          price: parseFloat(price),
          stock: parseInt(stock),
          description
        }
      });

      return {
        success: true,
        message: '商品添加成功',
        data: product,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '添加商品失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })

  // 更新商品（管理员）
  .put('/:id', async ({ params, body }) => {
    try {
      const { category_id, product_name, product_img, price, stock, description, status } = body as any;

      const product = await prisma.product.update({
        where: { product_id: parseInt(params.id) },
        data: {
          category_id: category_id ? parseInt(category_id) : undefined,
          product_name,
          product_img,
          price: price ? parseFloat(price) : undefined,
          stock: stock ? parseInt(stock) : undefined,
          description,
          status: status !== undefined ? parseInt(status) : undefined
        }
      });

      return {
        success: true,
        message: '商品更新成功',
        data: product,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '更新商品失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })

  // 删除商品（管理员）
  .delete('/:id', async ({ params }) => {
    try {
      await prisma.product.delete({
        where: { product_id: parseInt(params.id) }
      });

      return {
        success: true,
        message: '商品删除成功',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '删除商品失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  })

  // 上下架商品（管理员）
  .patch('/:id/status', async ({ params, body }) => {
    try {
      const { status } = body as any;

      const product = await prisma.product.update({
        where: { product_id: parseInt(params.id) },
        data: { status: parseInt(status) }
      });

      return {
        success: true,
        message: status === 1 ? '商品上架成功' : '商品下架成功',
        data: product,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '操作失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  });