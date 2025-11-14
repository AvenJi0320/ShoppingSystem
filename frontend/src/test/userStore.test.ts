import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from '../store/userStore'

describe('User Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUserStore.setState({
      user_id: null,
      phone: undefined,
      email: undefined,
      role: 0
    })
  })

  it('should initialize with default values', () => {
    const store = useUserStore.getState()
    expect(store.user_id).toBe(null)
    expect(store.phone).toBeUndefined()
    expect(store.email).toBeUndefined()
    expect(store.role).toBe(0)
  })

  it('should set user with all fields', () => {
    const store = useUserStore.getState()
    store.setUser(1, '13800138000', 'test@example.com', 1)

    const updatedStore = useUserStore.getState()
    expect(updatedStore.user_id).toBe(1)
    expect(updatedStore.phone).toBe('13800138000')
    expect(updatedStore.email).toBe('test@example.com')
    expect(updatedStore.role).toBe(1)
  })

  it('should set user without optional fields', () => {
    const store = useUserStore.getState()
    store.setUser(2)

    const updatedStore = useUserStore.getState()
    expect(updatedStore.user_id).toBe(2)
    expect(updatedStore.phone).toBeUndefined()
    expect(updatedStore.email).toBeUndefined()
    expect(updatedStore.role).toBe(0) // default role
  })

  it('should set user with role only', () => {
    const store = useUserStore.getState()
    store.setUser(3, undefined, undefined, 2)

    const updatedStore = useUserStore.getState()
    expect(updatedStore.user_id).toBe(3)
    expect(updatedStore.phone).toBeUndefined()
    expect(updatedStore.email).toBeUndefined()
    expect(updatedStore.role).toBe(2)
  })

  it('should clear user state', () => {
    const store = useUserStore.getState()
    // First set some user data
    store.setUser(1, '13800138000', 'test@example.com', 1)

    // Then clear it
    store.clearUser()

    const clearedStore = useUserStore.getState()
    expect(clearedStore.user_id).toBe(null)
    expect(clearedStore.phone).toBeUndefined()
    expect(clearedStore.email).toBeUndefined()
    expect(clearedStore.role).toBe(0)
  })

  it('should handle admin role (role = 1)', () => {
    const store = useUserStore.getState()
    store.setUser(1, '13800138000', 'admin@example.com', 1)

    const updatedStore = useUserStore.getState()
    expect(updatedStore.role).toBe(1)
    expect(updatedStore.user_id).toBe(1)
  })

  it('should handle regular user role (role = 0)', () => {
    const store = useUserStore.getState()
    store.setUser(2, '13800138001', 'user@example.com', 0)

    const updatedStore = useUserStore.getState()
    expect(updatedStore.role).toBe(0)
    expect(updatedStore.user_id).toBe(2)
  })
})