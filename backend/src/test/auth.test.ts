import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma client using factory function to avoid hoisting issues
vi.mock('../db/client.js', () => ({
  default: {
    sysUser: {
      findFirst: vi.fn<any>().mockResolvedValue(null),
      findUnique: vi.fn<any>().mockResolvedValue(null),
      create: vi.fn<any>().mockResolvedValue(null),
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

describe('Register Routes', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockPrisma.sysUser.findUnique.mockReset()
    mockPrisma.sysUser.create.mockReset()
  })

  it('should validate required fields', async () => {
    const app = new (await import('elysia')).Elysia().use(authRoutes)

    const response = await app.handle(
      new (globalThis as any).Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '',
          password: ''
        })
      })
    )

    const result = await response.json() as any
    expect(result.success).toBe(false)
    expect(result.message).toBe('手机号和密码不能为空')
  })

  it('should validate phone format', async () => {
    const app = new (await import('elysia')).Elysia().use(authRoutes)

    const response = await app.handle(
      new (globalThis as any).Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: 'invalid_phone',
          password: 'password123'
        })
      })
    )

    const result = await response.json() as any
    expect(result.success).toBe(false)
    expect(result.message).toBe('请输入有效的手机号')
  })

  it('should validate email format', async () => {
    const app = new (await import('elysia')).Elysia().use(authRoutes)

    const response = await app.handle(
      new (globalThis as any).Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '13800138000',
          email: 'invalid_email',
          password: 'password123'
        })
      })
    )

    const result = await response.json() as any
    expect(result.success).toBe(false)
    expect(result.message).toBe('请输入有效的邮箱地址')
  })

  it('should handle phone already exists', async () => {
    mockPrisma.sysUser.findUnique.mockResolvedValueOnce({ user_id: 1 })

    const app = new (await import('elysia')).Elysia().use(authRoutes)

    const response = await app.handle(
      new (globalThis as any).Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '13800138000',
          password: 'password123'
        })
      })
    )

    const result = await response.json() as any
    expect(result.success).toBe(false)
    expect(result.message).toBe('手机号已被注册')
  })

  it('should handle email already exists', async () => {
    mockPrisma.sysUser.findUnique
      .mockResolvedValueOnce(null) // phone check
      .mockResolvedValueOnce({ user_id: 1 }) // email check

    const app = new (await import('elysia')).Elysia().use(authRoutes)

    const response = await app.handle(
      new (globalThis as any).Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '13800138000',
          email: 'test@example.com',
          password: 'password123'
        })
      })
    )

    const result = await response.json() as any
    expect(result.success).toBe(false)
    expect(result.message).toBe('邮箱已被注册')
  })

  it('should handle successful registration', async () => {
    const mockNewUser = {
      user_id: 1,
      phone: '13800138000',
      email: 'test@example.com',
      password: 'password123'
    }

    mockPrisma.sysUser.findUnique.mockResolvedValue(null)
    mockPrisma.sysUser.create.mockResolvedValue(mockNewUser)

    const app = new (await import('elysia')).Elysia().use(authRoutes)

    const response = await app.handle(
      new (globalThis as any).Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '13800138000',
          email: 'test@example.com',
          password: 'password123'
        })
      })
    )

    const result = await response.json() as any
    expect(result.success).toBe(true)
    expect(result.message).toBe('注册成功')
    expect(result.data.user_id).toBe(1)
    expect(result.data.phone).toBe('13800138000')
    expect(result.data.email).toBe('test@example.com')
  })

  it('should handle registration without email', async () => {
    const mockNewUser = {
      user_id: 2,
      phone: '13800138001',
      email: null,
      password: 'password123'
    }

    mockPrisma.sysUser.findUnique.mockResolvedValue(null)
    mockPrisma.sysUser.create.mockResolvedValue(mockNewUser)

    const app = new (await import('elysia')).Elysia().use(authRoutes)

    const response = await app.handle(
      new (globalThis as any).Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '13800138001',
          password: 'password123'
        })
      })
    )

    const result = await response.json() as any
    expect(result.success).toBe(true)
    expect(result.message).toBe('注册成功')
    expect(result.data.user_id).toBe(2)
    expect(result.data.phone).toBe('13800138001')
    expect(result.data.email).toBe(null)
  })
})