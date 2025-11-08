import { Elysia } from 'elysia';
import prisma from './db/client.js';

const app = new Elysia()
  .get('/api/users', async () => {
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
  })
  .listen(3000);

console.log(`🚀 Server running at http://localhost:3000`);

export type App = typeof app;