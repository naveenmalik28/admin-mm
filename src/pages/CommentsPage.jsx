import { useEffect, useState } from "react"

import { fetchAdminComments, approveAdminComment, deleteAdminComment } from "../api/admin.api.js"
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx"
import { showToast } from "../components/ui/Toast.jsx"
import Modal from "../components/ui/Modal.jsx"

export default function CommentsPage() {
  const [comments, setComments] = useState([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [loading, setLoading] = useState(true)

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })

  const reload = () => {
    setLoading(true)
    fetchAdminComments()
      .then(setComments)
      .catch(() => showToast("Failed to load comments", "error"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const handleApprove = async (id) => {
    try {
      const result = await approveAdminComment(id)
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_approved: result.is_approved } : c))
      )
      showToast(result.is_approved ? "Comment approved" : "Comment unapproved", "success")
    } catch {
      showToast("Failed to update comment status.", "error")
    }
  }

  const executeDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteAdminComment(deleteModal.id)
      setComments((prev) => prev.filter((c) => c.id !== deleteModal.id))
      showToast("Comment deleted successfully")
    } catch {
      showToast("Failed to delete comment.", "error")
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
    <section className="space-y-6 animate-fade-in">
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Comment?"
        message="This comment will be permanently deleted. This action cannot be undone."
        onConfirm={executeDelete}
        confirmText="Delete"
      />

      {/* Header */}
      <div className="panel p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-mint font-semibold">Moderation</div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Comments</h1>
        <p className="mt-2 text-sm text-slatex/60 flex items-center gap-2">
          Review, approve, or remove user comments across all articles.
          <span className="inline-flex items-center justify-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
            {comments.filter((c) => !c.is_approved).length} pending
          </span>
        </p>
      </div>

      {/* Toolbar */}
      <div className="panel flex flex-wrap items-center gap-4 p-4 animate-fade-in-up">
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

      {loading && <LoadingSpinner />}

      {!loading && filtered.length === 0 && (
        <div className="panel p-16 flex flex-col items-center justify-center text-center animate-fade-in-up">
           <div className="text-4xl mb-4 text-slatex/20">💬</div>
           <div className="text-lg font-semibold text-slatex">No comments found</div>
           <div className="text-slatex/50 text-sm mt-1">{comments.length === 0 ? "No comments yet." : "No comments match your filters."}</div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="panel overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slatex/10 bg-slatex/5 text-[11px] font-bold uppercase tracking-widest text-slatex/50">
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Comment</th>
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slatex/5">
                {filtered.map((comment) => (
                  <tr key={comment.id} className="group transition hover:bg-mint/5">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slatex">{comment.author_name || "—"}</div>
                      <div className="text-xs font-medium text-slatex/40 mt-1">{comment.author_email}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[300px]">
                      <div className="line-clamp-2 text-slatex/80 font-medium">{comment.body}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-mint max-w-[200px] truncate block">{comment.article_title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
                          comment.is_approved
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {comment.is_approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slatex/50 whitespace-nowrap">{formatDate(comment.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleApprove(comment.id)}
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                            comment.is_approved
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {comment.is_approved ? "Unapprove" : "Approve"}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: comment.id })}
                          className="rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
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
