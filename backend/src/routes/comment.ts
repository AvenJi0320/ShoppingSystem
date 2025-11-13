import { Elysia } from 'elysia';
import prisma from '../db/client.js';

export const commentRoutes = new Elysia({ prefix: '/api/comments' })
  // 根据商品ID获取评论列表
  .get('/product/:productId', async ({ params, query }) => {
    try {
      const { productId } = params;
      const { user_id } = query as { user_id?: string };
      
      // 构建查询条件 - 只根据商品ID过滤，显示所有用户的评论
      const whereCondition = {
        product_id: parseInt(productId)
      };
      
      // 获取评论列表，包含用户信息
      const comments = await prisma.productComment.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              user_id: true,
              phone: true,
              email: true
            }
          }
        },
        orderBy: {
          create_time: 'desc'
        }
      });
      
      return {
        message: '获取评论列表成功',
        data: comments,
        metadata: {
          totalCount: comments.length,
          productId: parseInt(productId),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        message: '获取评论列表失败',
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      };
    }
  })
  
  // 创建新评论
  .post('/', async ({ body }) => {
    try {
      const { user_id, product_id, score, content } = body as {
        user_id: number;
        product_id: number;
        score: number;
        content?: string;
      };
      
      // 验证必要参数
      if (!user_id || !product_id || !score) {
        return {
          message: '缺少必要参数',
          error: 'user_id, product_id, score 为必填参数',
          timestamp: new Date().toISOString()
        };
      }
      
      // 验证评分范围
      if (score < 1 || score > 5) {
        return {
          message: '评分参数错误',
          error: 'score 必须在 1-5 之间',
          timestamp: new Date().toISOString()
        };
      }
      
      // 检查用户是否存在
      const userExists = await prisma.sysUser.findUnique({
        where: { user_id }
      });
      
      if (!userExists) {
        return {
          message: '用户不存在',
          error: `用户ID ${user_id} 不存在`,
          timestamp: new Date().toISOString()
        };
      }
      
      // 检查商品是否存在
      const productExists = await prisma.product.findUnique({
        where: { product_id }
      });
      
      if (!productExists) {
        return {
          message: '商品不存在',
          error: `商品ID ${product_id} 不存在`,
          timestamp: new Date().toISOString()
        };
      }
      
      // 创建评论
      const newComment = await prisma.productComment.create({
        data: {
          user_id,
          product_id,
          score,
          content: content || null
        },
        include: {
          user: {
            select: {
              user_id: true,
              phone: true,
              email: true
            }
          }
        }
      });
      
      return {
        message: '评论创建成功',
        data: newComment,
        metadata: {
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        message: '创建评论失败',
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      };
    }
  })

  // 删除评论（用户只能删除自己的评论）
  .delete('/:commentId', async ({ params, query }) => {
    try {
      const { commentId } = params;
      const { user_id } = query as { user_id?: string };

      if (!user_id) {
        return {
          message: '缺少用户ID',
          error: 'user_id 为必填参数',
          timestamp: new Date().toISOString()
        };
      }

      // 查找评论
      const comment = await prisma.productComment.findUnique({
        where: { comment_id: parseInt(commentId) }
      });

      if (!comment) {
        return {
          message: '评论不存在',
          error: `评论ID ${commentId} 不存在`,
          timestamp: new Date().toISOString()
        };
      }

      // 检查是否是评论所有者
      if (comment.user_id !== parseInt(user_id)) {
        return {
          message: '权限不足',
          error: '只能删除自己的评论',
          timestamp: new Date().toISOString()
        };
      }

      // 删除评论
      await prisma.productComment.delete({
        where: { comment_id: parseInt(commentId) }
      });

      return {
        message: '评论删除成功',
        metadata: {
          commentId: parseInt(commentId),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        message: '删除评论失败',
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      };
    }
  });