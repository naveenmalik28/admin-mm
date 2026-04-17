import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { fetchAdminSummary } from "../api/admin.api.js"
import StatCard from "../components/ui/StatCard.jsx"
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx"

const STATUS_COLORS = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-slate-200 text-slate-600",
}

const formatDate = (iso) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function OverviewPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminSummary()
      .then(setSummary)
      .catch(() => setSummary({}))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner fullPage />

  const cards = [
    { label: "Users", value: summary?.users ?? "—", icon: "👥" },
    { label: "Articles", value: summary?.articles ?? "—", icon: "📝" },
    { label: "Published", value: summary?.published_articles ?? "—", icon: "✅" },
    { label: "Drafts", value: summary?.draft_articles ?? "—", icon: "📋" },
    { label: "Categories", value: summary?.categories ?? "—", icon: "📂" },
    { label: "Tags", value: summary?.tags ?? "—", icon: "🏷️" },
    { label: "Comments", value: summary?.comments ?? "—", icon: "💬" },
    { label: "Pending comments", value: summary?.pending_comments ?? "—", icon: "⏳" },
    { label: "Subscriptions", value: summary?.subscriptions ?? "—", icon: "🔑" },
    { label: "Active subs", value: summary?.active_subscriptions ?? "—", icon: "🟢" },
    { label: "Payments", value: summary?.payments ?? "—", icon: "💳" },
  ]

  const recentArticles = summary?.recent_articles || []

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="panel p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-mint">Dashboard</div>
        <h1 className="mt-4 text-4xl font-semibold">Platform overview</h1>
        <p className="mt-2 text-sm text-slatex/60">Real-time metrics for your thought-sharing platform.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, idx) => (
          <div key={card.label} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
            <StatCard {...card} />
          </div>
        ))}
      </section>

      {/* Recent articles */}
      {recentArticles.length > 0 && (
        <section className="panel overflow-hidden animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between border-b border-slatex/5 p-6">
            <h2 className="text-xl font-semibold">Recent Articles</h2>
            <Link to="/articles" className="inline-flex items-center gap-1 rounded-full bg-slatex/5 px-4 py-2 text-sm font-semibold text-slatex transition hover:bg-slatex/10">
              View all
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slatex/10 bg-slatex/5 text-xs uppercase tracking-wider text-slatex/50">
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Author</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 text-right font-semibold">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slatex/5">
                {recentArticles.map((article) => (
                  <tr key={article.id} className="group transition hover:bg-mint/5">
                    <td className="px-6 py-4 max-w-[200px]">
                      <Link to={`/articles/${article.id}/edit`} className="block truncate font-semibold text-slatex transition group-hover:text-mint">
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slatex/60">{article.author?.full_name || article.author?.email || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_COLORS[article.status] || "bg-slate-100 text-slate-500"}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slatex/50 whitespace-nowrap">{formatDate(article.created_at)}</td>
                    <td className="px-6 py-4 text-right font-medium tabular-nums">{article.view_count?.toLocaleString() ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
