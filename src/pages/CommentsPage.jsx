import { useEffect, useState } from "react"

import { fetchAdminComments, approveAdminComment, deleteAdminComment } from "../api/admin.api.js"

export default function CommentsPage() {
  const [comments, setComments] = useState([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [loading, setLoading] = useState(true)

  const reload = () => {
    setLoading(true)
    fetchAdminComments()
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const handleApprove = async (id) => {
    try {
      const result = await approveAdminComment(id)
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_approved: result.is_approved } : c))
      )
    } catch {
      alert("Failed to update comment status.")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this comment permanently?")) return
    try {
      await deleteAdminComment(id)
      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch {
      alert("Failed to delete comment.")
    }
  }

  const filtered = comments.filter((c) => {
    const matchSearch =
      !search ||
      c.body.toLowerCase().includes(search.toLowerCase()) ||
      c.author_email.toLowerCase().includes(search.toLowerCase()) ||
      c.article_title.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      !filterStatus ||
      (filterStatus === "approved" && c.is_approved) ||
      (filterStatus === "pending" && !c.is_approved)
    return matchSearch && matchStatus
  })

  const formatDate = (iso) => {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="panel p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-mint">Moderation</div>
        <h1 className="mt-4 text-4xl font-semibold">Comments</h1>
        <p className="mt-2 text-sm text-slatex/60">
          Review, approve, or remove user comments across all articles.
          <span className="ml-2 font-semibold text-slatex">
            {comments.filter((c) => !c.is_approved).length} pending
          </span>
        </p>
      </div>

      {/* Toolbar */}
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <input
          className="field flex-1"
          placeholder="Search by text, author, or article…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="field w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All comments</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading && <div className="panel p-6 text-center text-slatex/50">Loading comments…</div>}

      {!loading && filtered.length === 0 && (
        <div className="panel p-8 text-center text-slatex/50">
          {comments.length === 0 ? "No comments yet." : "No comments match your filters."}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slatex/10 text-xs uppercase tracking-wider text-slatex/50">
                  <th className="px-5 py-4">Author</th>
                  <th className="px-5 py-4">Comment</th>
                  <th className="px-5 py-4">Article</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((comment) => (
                  <tr key={comment.id} className="border-b border-slatex/5 last:border-0 hover:bg-mint/5 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slatex">{comment.author_name || "—"}</div>
                      <div className="text-xs text-slatex/40">{comment.author_email}</div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="line-clamp-2 text-slatex/80">{comment.body}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-mint max-w-[200px] truncate block">{comment.article_title}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          comment.is_approved
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {comment.is_approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slatex/50 whitespace-nowrap">{formatDate(comment.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(comment.id)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                            comment.is_approved
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {comment.is_approved ? "Unapprove" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
