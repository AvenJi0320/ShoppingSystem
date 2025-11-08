import { Elysia } from 'elysia';

const app = new Elysia()
  .get('/', () => 'Hello from Shopping System Backend!')
  .get('/api/health', () => ({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'shopping-system-backend',
    version: '1.0.0'
  }))
  .get('/api/test', () => ({
    message: 'Backend connection successful',
    data: {
      users: [
        { id: 1, name: '张三', email: 'zhangsan@example.com' },
        { id: 2, name: '李四', email: 'lisi@example.com' }
      ],
      products: [
        { id: 1, name: '商品A', price: 99.99, stock: 100 },
        { id: 2, name: '商品B', price: 149.99, stock: 50 }
      ],
      serverTime: new Date().toISOString(),
      connectionTest: true
    },
    metadata: {
      endpoint: '/api/test',
      method: 'GET',
      responseTime: Date.now()
    }
  }))
  .listen(3000);

console.log(`🚀 Server running at http://localhost:3000`);

export type App = typeof app;