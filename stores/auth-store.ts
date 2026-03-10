"use client"

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { User } from '@/validations/auth'

type AuthUser = User | null

interface AuthStore {
  user: AuthUser
  setUser: (user: AuthUser) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null })
    }),
    {
      name: 'auth-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user })
    }
  )
)

export const getStoredUser = () => useAuthStore.getState().user