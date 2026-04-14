import { useEffect, useState } from "react"

import { fetchAdminPayments, fetchAdminSubscriptions } from "../api/admin.api.js"

const formatDate = (iso) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

const STATUS_COLORS = {
  active: "bg-emerald-100 text-emerald-700",
  expired: "bg-slate-200 text-slate-600",
  cancelled: "bg-red-100 text-red-600",
  pending: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-blue-100 text-blue-600",
}

export default function RevenuePage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchAdminSubscriptions(), fetchAdminPayments()])
      .then(([s, p]) => {
        setSubscriptions(s)
        setPayments(p)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalRevenue = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-mint">Revenue</div>
        <h1 className="mt-4 text-4xl font-semibold">Subscriptions & Payments</h1>
        <p className="mt-2 text-sm text-slatex/60">Track subscription activity and payment history.</p>
      </section>

      {loading && <div className="panel p-6 text-center text-slatex/50">Loading…</div>}

      {!loading && (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="panel p-6">
              <div className="text-sm text-slatex/60">Total Subscriptions</div>
              <div className="mt-2 text-3xl font-semibold tabular-nums">{subscriptions.length}</div>
            </div>
            <div className="panel p-6">
              <div className="text-sm text-slatex/60">Total Payments</div>
              <div className="mt-2 text-3xl font-semibold tabular-nums">{payments.length}</div>
            </div>
            <div className="panel p-6">
              <div className="text-sm text-slatex/60">Total Revenue</div>
              <div className="mt-2 text-3xl font-semibold tabular-nums">
                ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <section className="grid gap-6 xl:grid-cols-2">
            {/* Subscriptions */}
            <div className="panel overflow-hidden">
              <div className="border-b border-slatex/10 px-6 py-4">
                <h2 className="text-xl font-semibold">Subscriptions</h2>
              </div>
              {subscriptions.length === 0 ? (
                <div className="p-8 text-center text-slatex/50">No subscriptions yet.</div>
              ) : (
                <div className="divide-y divide-slatex/5">
                  {subscriptions.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-mint/5 transition">
                      <div>
                        <div className="font-semibold text-sm">{item.user_email}</div>
                        <div className="text-xs text-slatex/50 mt-0.5">
                          {item.plan?.name} • {formatDate(item.starts_at)} → {formatDate(item.expires_at)}
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[item.status] || "bg-slate-100 text-slate-500"}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payments */}
            <div className="panel overflow-hidden">
              <div className="border-b border-slatex/10 px-6 py-4">
                <h2 className="text-xl font-semibold">Payments</h2>
              </div>
              {payments.length === 0 ? (
                <div className="p-8 text-center text-slatex/50">No payments yet.</div>
              ) : (
                <div className="divide-y divide-slatex/5">
                  {payments.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-mint/5 transition">
                      <div>
                        <div className="font-semibold text-sm">{item.user_email}</div>
                        <div className="text-xs text-slatex/50 mt-0.5">
                          {item.payment_gateway || "—"} • {formatDate(item.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm tabular-nums">{item.currency} {item.amount}</div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${STATUS_COLORS[item.status] || "bg-slate-100 text-slate-500"}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
