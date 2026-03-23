"use client"

import { create } from 'zustand'
import { User } from '@/validations/auth'

type AuthUser = User | null

interface AuthStore {
  user: AuthUser
  setUser: (user: AuthUser) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null })
}))

export const getStoredUser = () => useAuthStore.getState().user