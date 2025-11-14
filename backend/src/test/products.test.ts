import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma client
vi.mock('../db/client.js', () => ({
  default: {
    product: {
      findMany: vi.fn<any>().mockResolvedValue([]),
      count: vi.fn<any>().mockResolvedValue(0),
      findUnique: vi.fn<any>().mockResolvedValue(null),
      create: vi.fn<any>().mockResolvedValue(null),
      update: vi.fn<any>().mockResolvedValue(null),
      delete: vi.fn<any>().mockResolvedValue(null),
    },
  },
}))

import { productRoutes } from '../routes/products.js'
import prisma from '../db/client.js'
const mockPrisma = prisma as any

describe('Product Routes', () => {
  beforeEach(() => {
    // Reset mocks before each test
    Object.values(mockPrisma.product).forEach((mock: any) => mock.mockReset())
  })

  describe('GET /', () => {
    it('should get products list with default pagination', async () => {
      const mockProducts = [
        { product_id: 1, product_name: 'Test Product', price: 100 }
      ]
      mockPrisma.product.findMany.mockResolvedValue(mockProducts)
      mockPrisma.product.count.mockResolvedValue(1)

      const app = new (await import('elysia')).Elysia().use(productRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/products')
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockProducts)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(10)
    })

    it('should filter products by category', async () => {
      const mockProducts = [
        { product_id: 1, product_name: 'Test Product', category_id: 1 }
      ]
      mockPrisma.product.findMany.mockResolvedValue(mockProducts)
      mockPrisma.product.count.mockResolvedValue(1)

      const app = new (await import('elysia')).Elysia().use(productRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/products?category=1')
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category_id: 1 })
        })
      )
    })

    it('should search products by name', async () => {
      const mockProducts = [
        { product_id: 1, product_name: 'Test Product' }
      ]
      mockPrisma.product.findMany.mockResolvedValue(mockProducts)
      mockPrisma.product.count.mockResolvedValue(1)

      const app = new (await import('elysia')).Elysia().use(productRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/products?search=Test')
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            product_name: {
              contains: 'Test',
              mode: 'insensitive'
            }
          })
        })
      )
    })
  })

  describe('GET /:id', () => {
    it('should get product by id', async () => {
      const mockProduct = { product_id: 1, product_name: 'Test Product' }
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)

      const app = new (await import('elysia')).Elysia().use(productRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/products/1')
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockProduct)
    })

    it('should return not found for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null)

      const app = new (await import('elysia')).Elysia().use(productRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/products/999')
      )

      const result = await response.json() as any
      expect(result.success).toBe(false)
      expect(result.message).toBe('商品不存在')
    })
  })

  describe('POST /', () => {
    it('should create new product', async () => {
      const mockProduct = {
        product_id: 1,
        category_id: 1,
        product_name: 'New Product',
        price: 100,
        stock: 10
      }
      mockPrisma.product.create.mockResolvedValue(mockProduct)

      const app = new (await import('elysia')).Elysia().use(productRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category_id: 1,
            product_name: 'New Product',
            product_img: 'image.jpg',
            price: 100,
            stock: 10,
            description: 'Test description'
          })
        })
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.message).toBe('商品添加成功')
      expect(result.data).toEqual(mockProduct)
    })
  })

  describe('PUT /:id', () => {
    it('should update product', async () => {
      const mockProduct = {
        product_id: 1,
        product_name: 'Updated Product',
        price: 150
      }
      mockPrisma.product.update.mockResolvedValue(mockProduct)

      const app = new (await import('elysia')).Elysia().use(productRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/products/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_name: 'Updated Product',
            price: 150
          })
        })
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.message).toBe('商品更新成功')
      expect(result.data).toEqual(mockProduct)
    })
  })

  describe('DELETE /:id', () => {
    it('should delete product', async () => {
      mockPrisma.product.delete.mockResolvedValue({})

      const app = new (await import('elysia')).Elysia().use(productRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/products/1', {
          method: 'DELETE'
        })
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.message).toBe('商品删除成功')
    })
  })

  describe('PATCH /:id/status', () => {
    it('should activate product (status = 1)', async () => {
      const mockProduct = { product_id: 1, status: 1 }
      mockPrisma.product.update.mockResolvedValue(mockProduct)

      const app = new (await import('elysia')).Elysia().use(productRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/products/1/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 1 })
        })
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.message).toBe('商品上架成功')
      expect(result.data.status).toBe(1)
    })

    it('should deactivate product (status = 0)', async () => {
      const mockProduct = { product_id: 1, status: 0 }
      mockPrisma.product.update.mockResolvedValue(mockProduct)

      const app = new (await import('elysia')).Elysia().use(productRoutes)

      const response = await app.handle(
        new (globalThis as any).Request('http://localhost/api/products/1/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 0 })
        })
      )

      const result = await response.json() as any
      expect(result.success).toBe(true)
      expect(result.message).toBe('商品下架成功')
      expect(result.data.status).toBe(0)
    })
  })
})