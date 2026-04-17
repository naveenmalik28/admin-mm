import { useEffect, useState } from "react"

import { fetchAdminPayments, fetchAdminSubscriptions } from "../api/admin.api.js"
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx"

const formatDate = (iso) => {
  if (!iso) return "-"
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

const sumSuccessfulPayments = (payments, currency) =>
  payments
    .filter((payment) => payment.status === "success" && (payment.currency || "INR").toUpperCase() === currency)
    .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)

export default function RevenuePage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchAdminSubscriptions(), fetchAdminPayments()])
      .then(([subscriptionData, paymentData]) => {
        setSubscriptions(subscriptionData)
        setPayments(paymentData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalRevenueInr = sumSuccessfulPayments(payments, "INR")
  const totalRevenueUsd = sumSuccessfulPayments(payments, "USD")

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="panel p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-mint">Revenue</div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Subscriptions and Payments</h1>
        <p className="mt-2 text-sm text-slatex/60">Track subscription activity and payment history across both INR and USD transactions.</p>
      </section>

      {loading && <LoadingSpinner />}

      {!loading && (
        <>
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="panel border-b-4 border-b-slatex/10 p-6 shadow-sm transition-all hover:border-b-mint">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slatex/50">Total subscriptions</div>
              <div className="mt-3 text-4xl font-black tracking-tighter text-slatex">{subscriptions.length}</div>
            </div>
            <div className="panel border-b-4 border-b-slatex/10 p-6 shadow-sm transition-all hover:border-b-mint">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slatex/50">Total payments</div>
              <div className="mt-3 text-4xl font-black tracking-tighter text-slatex">{payments.length}</div>
            </div>
            <div className="panel border-b-4 border-b-emerald-500 p-6 shadow-sm transition-all hover:shadow-lg">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slatex/50">Successful INR revenue</div>
              <div className="mt-3 text-3xl font-black tracking-tighter text-emerald-600">
                INR {totalRevenueInr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="panel border-b-4 border-b-coral/80 p-6 shadow-sm transition-all hover:shadow-lg">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slatex/50">Successful USD revenue</div>
              <div className="mt-3 text-3xl font-black tracking-tighter text-coral">
                USD {totalRevenueUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="panel flex flex-col overflow-hidden">
              <div className="border-b border-slatex/10 bg-slatex/5 px-6 py-5">
                <h2 className="text-lg font-bold tracking-tight text-slatex">Subscriptions</h2>
              </div>
              {subscriptions.length === 0 ? (
                <div className="my-auto p-12 text-center font-medium text-slatex/50">No subscriptions yet.</div>
              ) : (
                <div className="max-h-[600px] divide-y divide-slatex/5 overflow-y-auto">
                  {subscriptions.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-5 transition hover:bg-mint/5">
                      <div>
                        <div className="text-sm font-bold text-slatex">{item.user_email}</div>
                        <div className="mt-1 text-xs font-medium text-slatex/50">
                          <span className="text-mint">{item.plan?.name}</span>
                          <span className="mx-2 opacity-40">/</span>
                          {formatDate(item.starts_at)} to {formatDate(item.expires_at)}
                        </div>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm ${STATUS_COLORS[item.status] || "bg-slate-100 text-slate-500"}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="panel flex flex-col overflow-hidden">
              <div className="border-b border-slatex/10 bg-slatex/5 px-6 py-5">
                <h2 className="text-lg font-bold tracking-tight text-slatex">Payments</h2>
              </div>
              {payments.length === 0 ? (
                <div className="my-auto p-12 text-center font-medium text-slatex/50">No payments yet.</div>
              ) : (
                <div className="max-h-[600px] divide-y divide-slatex/5 overflow-y-auto">
                  {payments.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-5 transition hover:bg-mint/5">
                      <div>
                        <div className="text-sm font-bold text-slatex">{item.user_email}</div>
                        <div className="mt-1 text-xs font-medium text-slatex/50">
                          {item.payment_gateway || "-"}
                          <span className="mx-2 opacity-40">/</span>
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 text-right">
                        <div className="text-sm font-black tabular-nums text-slatex">
                          {(item.currency || "INR").toUpperCase()} {item.amount}
                        </div>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm ${STATUS_COLORS[item.status] || "bg-slate-100 text-slate-500"}`}>
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
