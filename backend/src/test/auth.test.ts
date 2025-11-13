import { describe, it, expect, vi } from 'vitest'

// Mock Prisma client using factory function to avoid hoisting issues
vi.mock('../db/client.js', () => ({
  default: {
    sysUser: {
      findFirst: vi.fn<any>().mockResolvedValue(null),
    },
  },
}))

// Import after mocking
import { authRoutes } from '../routes/auth.js'

// Get reference to the mocked prisma client
import prisma from '../db/client.js'
const mockPrisma = prisma as any

describe('Auth Routes', () => {
  it('should validate phone format', async () => {
    // Test the route handler directly
    const app = new (await import('elysia')).Elysia().use(authRoutes)

    const response = await app.handle(
      new (globalThis as any).Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'invalid_phone',
          password: 'password123'
        })
      })
    )

    const result = await response.json() as any
    expect(result.success).toBe(false)
    expect(result.message).toBe('请输入有效的手机号或邮箱地址')
  })

  it('should handle user not found', async () => {
    mockPrisma.sysUser.findFirst.mockResolvedValue(null)

    const app = new (await import('elysia')).Elysia().use(authRoutes)

    const response = await app.handle(
      new (globalThis as any).Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '13800138000',
          password: 'password123'
        })
      })
    )

    const result = await response.json() as any
    expect(result.success).toBe(false)
    expect(result.message).toBe('用户不存在')
  })

  it('should handle successful login', async () => {
    const mockUser = {
      user_id: 1,
      phone: '13800138000',
      email: 'test@example.com',
      password: 'password123'
    }

    mockPrisma.sysUser.findFirst.mockResolvedValue(mockUser)

    const app = new (await import('elysia')).Elysia().use(authRoutes)

    const response = await app.handle(
      new (globalThis as any).Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '13800138000',
          password: 'password123'
        })
      })
    )

    const result = await response.json() as any
    expect(result.success).toBe(true)
    expect(result.message).toBe('登录成功')
    expect(result.data.user_id).toBe(1)
  })

  it('should handle wrong password', async () => {
    const mockUser = {
      user_id: 1,
      phone: '13800138000',
      email: 'test@example.com',
      password: 'password123'
    }

    mockPrisma.sysUser.findFirst.mockResolvedValue(mockUser)

    const app = new (await import('elysia')).Elysia().use(authRoutes)

    const response = await app.handle(
      new (globalThis as any).Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '13800138000',
          password: 'wrongpassword'
        })
      })
    )

    const result = await response.json() as any
    expect(result.success).toBe(false)
    expect(result.message).toBe('密码错误')
  })
})