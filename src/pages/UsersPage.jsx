import { useEffect, useState } from "react"

import { fetchAdminUsers } from "../api/admin.api.js"

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
    <section className="space-y-6">
      <div className="panel p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-mint">Users</div>
        <h1 className="mt-4 text-4xl font-semibold">Accounts & Access</h1>
        <p className="mt-2 text-sm text-slatex/60">
          {users.length} registered user{users.length !== 1 ? "s" : ""} on the platform.
        </p>
      </div>

      {/* Toolbar */}
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <input
          className="field flex-1"
          placeholder="Search by email, username, or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="text-sm text-slatex/50 font-semibold">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {loading && <div className="panel p-6 text-center text-slatex/50">Loading users…</div>}

      {!loading && (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slatex/10 text-xs uppercase tracking-wider text-slatex/50">
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Username</th>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4 text-center">Role</th>
                  <th className="px-5 py-4">Subscription</th>
                  <th className="px-5 py-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slatex/50">
                      {users.length === 0 ? "No users yet." : "No users match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="border-b border-slatex/5 last:border-0 hover:bg-mint/5 transition">
                      <td className="px-5 py-4 font-semibold">{user.email}</td>
                      <td className="px-5 py-4 text-slatex/60">{user.username}</td>
                      <td className="px-5 py-4 text-slatex/60">{user.full_name || "—"}</td>
                      <td className="px-5 py-4 text-center">
                        {user.is_staff ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Staff</span>
                        ) : (
                          <span className="rounded-full bg-slatex/5 px-3 py-1 text-xs font-semibold text-slatex/50">User</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {user.has_active_subscription ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Inactive</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slatex/50 whitespace-nowrap">{formatDate(user.date_joined)}</td>
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
