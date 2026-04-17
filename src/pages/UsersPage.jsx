import { useEffect, useState } from "react"

import { fetchAdminUsers } from "../api/admin.api.js"
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx"

const formatDate = (iso) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((user) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      user.email.toLowerCase().includes(q) ||
      (user.username || "").toLowerCase().includes(q) ||
      (user.full_name || "").toLowerCase().includes(q)
    )
  })

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="panel p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-mint font-semibold">Users</div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Accounts & Access</h1>
        <p className="mt-2 text-sm text-slatex/60">
          {users.length} registered user{users.length !== 1 ? "s" : ""} on the platform.
        </p>
      </div>

      {/* Toolbar */}
      <div className="panel flex flex-wrap items-center gap-4 p-4 animate-fade-in-up">
        <input
          className="field flex-1"
          placeholder="Search by email, username, or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="text-sm text-slatex/50 font-bold bg-slatex/5 px-4 py-2 rounded-full">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && (
        <div className="panel overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slatex/10 bg-slatex/5 text-[11px] font-bold uppercase tracking-widest text-slatex/50">
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slatex/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-4xl mb-4 text-slatex/20">👥</div>
                      <div className="text-lg font-semibold text-slatex">No users found</div>
                      <div className="text-slatex/50 text-sm mt-1">{users.length === 0 ? "No users yet." : "No users match your search."}</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="group transition hover:bg-mint/5">
                      <td className="px-6 py-4 font-bold text-slatex">{user.email}</td>
                      <td className="px-6 py-4 font-medium text-slatex/60">{user.username}</td>
                      <td className="px-6 py-4 font-medium text-slatex/60">{user.full_name || "—"}</td>
                      <td className="px-6 py-4 text-center">
                        {user.is_staff ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">Staff</span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slatex/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slatex/50">User</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.has_active_subscription ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">Active</span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slatex/50 whitespace-nowrap">{formatDate(user.date_joined)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
