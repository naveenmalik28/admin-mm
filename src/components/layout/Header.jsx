import { useNavigate } from "react-router-dom"

import { useAdminAuthStore } from "../../store/authStore.js"

export default function Header() {
  const user = useAdminAuthStore((state) => state.user)
  const logout = useAdminAuthStore((state) => state.logout)
  const navigate = useNavigate()

  return (
    <header className="border-b border-white/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div>
          <div className="text-xs uppercase tracking-[0.32em] text-mint">Magnivel Media</div>
          <div className="text-2xl font-semibold">Admin Dashboard</div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slatex/70">{user?.email}</span>
          <button
            className="rounded-full bg-slatex px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              logout()
              navigate("/login")
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

