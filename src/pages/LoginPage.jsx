import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { loginAdmin } from "../api/auth.api.js"
import { useAdminAuthStore } from "../store/authStore.js"

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAdminAuthStore((state) => state.login)
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    try {
      const response = await loginAdmin(form)
      if (!response.user?.is_staff) {
        setError("This account is not marked as staff in Django.")
        return
      }
      login(response.user, response.access, response.refresh)
      navigate("/")
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        (error.request ? "Backend unavailable. Start the Django API in backend-mm." : null)

      setError(detail || "Unable to authenticate. Check the email and password and try again.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel w-full max-w-md p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-mint">Admin sign in</div>
        <h1 className="mt-4 text-4xl font-semibold">Staff access</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input className="field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="w-full rounded-full bg-slatex px-4 py-3 text-sm font-semibold text-white" type="submit">Enter admin</button>
        </form>
      </div>
    </div>
  )
}
