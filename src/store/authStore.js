import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAdminAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      login: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "magnivel-admin-auth" },
  ),
)

