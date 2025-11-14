import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma client
vi.mock('../db/client.js', () => ({
  default: {
    promotion: {
      findMany: vi.fn<any>().mockResolvedValue([]),
      count: vi.fn<any>().mockResolvedValue(0),
      findUnique: vi.fn<any>().mockResolvedValue(null),
      create: vi.fn<any>().mockResolvedValue(null),
      update: vi.fn<any>().mockResolvedValue(null),
      delete: vi.fn<any>().mockResolvedValue(null),
    },
    promotionRule: {
      deleteMany: vi.fn<any>().mockResolvedValue(null),
    },
  },
}))

import { promotionRoutes } from '../routes/promotions.js'
import prisma from '../db/client.js'
const mockPrisma = prisma as any

describe('Promotion Routes', () => {
  beforeEach(() => {
    // Reset mocks before each test
    Object.values(mockPrisma.promotion).forEach((mock: any) => mock.mockReset())
    Object.values(mockPrisma.promotionRule).forEach((mock: any) => mock.mockReset())
  })

  describe('GET /', () => {
    it('should get promotions list with default pagination', async () => {
      const mockPromotions = [
        {
          promotion_id: 1,
          title: 'Test Promotion',
          rules: [],
          creator: { user_id: 1, phone: '13800138000' }
        }
      ]
      mockPrisma.promotion.findMany.mockResolvedValue(mockPromotions)
      mockPrisma.promotion.count.mockResolvedValue(1)

      const app = new (await import('elysia')).Elysia().use(promotionRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/promotions')
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPromotions)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(10)
    })

    it('should filter promotions by status', async () => {
      const mockPromotions = [
        { promotion_id: 1, title: 'Active Promotion', status: 1 }
      ]
      mockPrisma.promotion.findMany.mockResolvedValue(mockPromotions)
      mockPrisma.promotion.count.mockResolvedValue(1)

      const app = new (await import('elysia')).Elysia().use(promotionRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/promotions?status=1')
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(mockPrisma.promotion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 1 })
        })
      )
    })

    it('should filter promotions by type', async () => {
      const mockPromotions = [
        { promotion_id: 1, title: 'Discount Promotion', type: 1 }
      ]
      mockPrisma.promotion.findMany.mockResolvedValue(mockPromotions)
      mockPrisma.promotion.count.mockResolvedValue(1)

      const app = new (await import('elysia')).Elysia().use(promotionRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/promotions?type=1')
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(mockPrisma.promotion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 1 })
        })
      )
    })
  })

  describe('GET /:id', () => {
    it('should get promotion by id', async () => {
      const mockPromotion = {
        promotion_id: 1,
        title: 'Test Promotion',
        rules: [],
        creator: { user_id: 1, phone: '13800138000' }
      }
      mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion)

      const app = new (await import('elysia')).Elysia().use(promotionRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/promotions/1')
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPromotion)
    })

    it('should return not found for non-existent promotion', async () => {
      mockPrisma.promotion.findUnique.mockResolvedValue(null)

      const app = new (await import('elysia')).Elysia().use(promotionRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/promotions/999')
      )

      const result = await response.json() as any
      expect(result.success).toBe(false)
      expect(result.message).toBe('促销活动不存在')
    })
  })

  describe('POST /', () => {
    it('should create new promotion', async () => {
      const mockPromotion = {
        promotion_id: 1,
        title: 'New Promotion',
        type: 1,
        rules: []
      }
      mockPrisma.promotion.create.mockResolvedValue(mockPromotion)

      const app = new (await import('elysia')).Elysia().use(promotionRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New Promotion',
            description: 'Test description',
            type: 1,
            start_time: '2025-01-01T00:00:00Z',
            end_time: '2025-12-31T23:59:59Z',
            created_by: 1,
            rules: [{
              condition_type: 1,
              condition_value: 100,
              discount_type: 1,
              discount_value: 10
            }]
          })
        })
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.message).toBe('促销活动创建成功')
      expect(result.data).toEqual(mockPromotion)
    })
  })

  describe('PUT /:id', () => {
    it('should update promotion', async () => {
      const mockPromotion = {
        promotion_id: 1,
        title: 'Updated Promotion',
        rules: []
      }
      mockPrisma.promotion.update.mockResolvedValue(mockPromotion)

      const app = new (await import('elysia')).Elysia().use(promotionRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/promotions/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Updated Promotion',
            description: 'Updated description',
            rules: [{
              condition_type: 1,
              condition_value: 200,
              discount_type: 2,
              discount_value: 20
            }]
          })
        })
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.message).toBe('促销活动更新成功')
      expect(result.data).toEqual(mockPromotion)
    })
  })

  describe('DELETE /:id', () => {
    it('should delete promotion', async () => {
      mockPrisma.promotion.delete.mockResolvedValue({})

      const app = new (await import('elysia')).Elysia().use(promotionRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/promotions/1', {
          method: 'DELETE'
        })
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.message).toBe('促销活动删除成功')
    })
  })

  describe('PATCH /:id/status', () => {
    it('should update promotion status', async () => {
      const mockPromotion = { promotion_id: 1, status: 1 }
      mockPrisma.promotion.update.mockResolvedValue(mockPromotion)

      const app = new (await import('elysia')).Elysia().use(promotionRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/promotions/1/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 1 })
        })
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.message).toBe('促销活动状态更新成功')
      expect(result.data.status).toBe(1)
    })
  })
})