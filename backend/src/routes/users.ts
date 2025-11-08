import { Elysia } from 'elysia';
import prisma from '../db/client.js';

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .get('/', async () => {
    try {
      const users = await prisma.sysUser.findMany();
      
      return {
        message: 'All users from sys_user table',
        data: users,
        metadata: {
          totalCount: users.length,
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