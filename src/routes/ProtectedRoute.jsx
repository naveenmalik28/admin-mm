import { Navigate } from "react-router-dom"

import { useAdminAuthStore } from "../store/authStore.js"

export default function ProtectedRoute({ children }) {
  const user = useAdminAuthStore((state) => state.user)
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

