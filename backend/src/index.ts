import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { productRoutes } from './routes/products.js';
import { orderRoutes } from './routes/orders.js';

const app = new Elysia()
  .use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }))
  .use(authRoutes)
  .use(userRoutes)
  .use(productRoutes)
  .use(orderRoutes)
  .listen(3000);

console.log(`🚀 Server running at http://localhost:3000`);

export type App = typeof app;