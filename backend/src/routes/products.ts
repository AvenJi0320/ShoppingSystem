import { Elysia } from 'elysia';
import prisma from '../db/client.js';

export const productRoutes = new Elysia({ prefix: '/api/products' })
  .get('/', async () => {
    try {
      const products = await prisma.product.findMany();
      
      return {
        message: 'All products from product table',
        data: products,
        metadata: {
          totalCount: products.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        message: 'Database error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  });