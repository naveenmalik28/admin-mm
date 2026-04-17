import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import {
  fetchAdminArticles,
  deleteAdminArticle,
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  fetchAdminTags,
  createAdminTag,
  updateAdminTag,
  deleteAdminTag,
} from "../api/admin.api.js"
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx"
import { showToast } from "../components/ui/Toast.jsx"
import Modal from "../components/ui/Modal.jsx"

const STATUS_COLORS = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-slate-200 text-slate-600",
}

const formatDate = (iso) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [tab, setTab] = useState("articles")
  const [newCatName, setNewCatName] = useState("")
  const [newCatSlug, setNewCatSlug] = useState("")
  const [newCatDesc, setNewCatDesc] = useState("")
  const [newTagName, setNewTagName] = useState("")
  const [newTagSlug, setNewTagSlug] = useState("")
  const [loading, setLoading] = useState(true)

  // Sub-component modals
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: null })

  // Inline edit state
  const [editCatId, setEditCatId] = useState(null)
  const [editCatForm, setEditCatForm] = useState({ name: "", slug: "", description: "" })
  const [editTagId, setEditTagId] = useState(null)
  const [editTagForm, setEditTagForm] = useState({ name: "", slug: "" })

  const reload = (showLoad = true) => {
    if (showLoad) setLoading(true)
    Promise.all([fetchAdminArticles(), fetchAdminCategories(), fetchAdminTags()])
      .then(([a, c, t]) => {
        setArticles(a)
        setCategories(c)
        setTags(t)
      })
      .catch(() => showToast("Failed to load content.", "error"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
  }, [])

  const executeDelete = async () => {
    const { type, id } = deleteModal
    try {
      if (type === "article") {
        await deleteAdminArticle(id)
        setArticles((prev) => prev.filter((a) => a.id !== id))
        showToast("Article deleted successfully")
      } else if (type === "category") {
        await deleteAdminCategory(id)
        setCategories((prev) => prev.filter((c) => c.id !== id))
        showToast("Category deleted successfully")
      } else if (type === "tag") {
        await deleteAdminTag(id)
        setTags((prev) => prev.filter((t) => t.id !== id))
        showToast("Tag deleted successfully")
      }
    } catch (error) {
      showToast("Failed to delete.", "error")
    }
  }

  // ── Category handlers ──
  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    const slug = newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    try {
      await createAdminCategory({ name: newCatName.trim(), slug, description: newCatDesc.trim() })
      setNewCatName("")
      setNewCatSlug("")
      setNewCatDesc("")
      showToast("Category created successfully")
      reload(false)
    } catch (error) {
      const msg = error.response?.data?.slug?.[0] || error.response?.data?.name?.[0] || "Failed to create category."
      showToast(msg, "error")
    }
  }

  const startEditCategory = (cat) => {
    setEditCatId(cat.id)
    setEditCatForm({ name: cat.name, slug: cat.slug, description: cat.description || "" })
  }

  const cancelEditCategory = () => {
    setEditCatId(null)
    setEditCatForm({ name: "", slug: "", description: "" })
  }

  const saveEditCategory = async () => {
    try {
      await updateAdminCategory(editCatId, editCatForm)
      cancelEditCategory()
      showToast("Category updated")
      reload(false)
    } catch (error) {
      const msg = error.response?.data?.slug?.[0] || error.response?.data?.name?.[0] || "Failed to update category."
      showToast(msg, "error")
    }
  }

  // ── Tag handlers ──
  const handleCreateTag = async (e) => {
    e.preventDefault()
    if (!newTagName.trim()) return
    const slug = newTagSlug.trim() || newTagName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    try {
      await createAdminTag({ name: newTagName.trim(), slug })
      setNewTagName("")
      setNewTagSlug("")
      showToast("Tag created successfully")
      reload(false)
    } catch (error) {
      const msg = error.response?.data?.slug?.[0] || error.response?.data?.name?.[0] || "Failed to create tag."
      showToast(msg, "error")
    }
  }

  const startEditTag = (tag) => {
    setEditTagId(tag.id)
    setEditTagForm({ name: tag.name, slug: tag.slug })
  }

  const cancelEditTag = () => {
    setEditTagId(null)
    setEditTagForm({ name: "", slug: "" })
  }

  const saveEditTag = async () => {
    try {
      await updateAdminTag(editTagId, editTagForm)
      cancelEditTag()
      showToast("Tag updated")
      reload(false)
    } catch (error) {
      const msg = error.response?.data?.slug?.[0] || error.response?.data?.name?.[0] || "Failed to update tag."
      showToast(msg, "error")
    }
  }

  // ── Filter ──
  const filtered = articles.filter((article) => {
    const matchSearch = !search || article.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || article.status === statusFilter
    const matchCategory = !categoryFilter || article.category?.id === Number(categoryFilter)
    return matchSearch && matchStatus && matchCategory
  })

  return (
    <section className="space-y-6 animate-fade-in">
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, type: null })}
        title={`Delete ${deleteModal.type}?`}
        message="This action cannot be undone. Are you sure you want to proceed?"
        onConfirm={executeDelete}
        confirmText="Delete"
      />

      {/* Title bar */}
      <div className="panel p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-mint font-semibold">Content management</div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Articles & Topics</h1>
        <p className="mt-2 text-sm text-slatex/60">Create, edit & manage all articles, categories, and tags for your platform.</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 p-1 rounded-full bg-slatex/5 w-max">
        {["articles", "categories", "tags"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-6 py-2.5 text-sm font-semibold capitalize transition ${
              tab === t ? "bg-white text-slatex shadow-md" : "text-slatex/50 hover:text-slatex"
            }`}
          >
            {t} {t === "articles" ? `(${articles.length})` : t === "categories" ? `(${categories.length})` : `(${tags.length})`}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}

      {/* ── Articles tab ── */}
      {!loading && tab === "articles" && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Toolbar */}
          <div className="panel flex flex-wrap items-center gap-4 p-4">
            <input
              className="field flex-1 min-w-[200px]"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select className="field w-auto" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <Link
              to="/articles/new"
              className="inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-mint/20 transition hover:-translate-y-0.5 hover:shadow-mint/30"
            >
              + New article
            </Link>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="panel p-16 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-slatex/5 flex items-center justify-center mb-4 text-2xl">📝</div>
              <h3 className="text-lg font-semibold text-slatex">No articles found</h3>
              <p className="mt-1 text-sm text-slatex/50">{articles.length === 0 ? 'Click "New article" to create one.' : 'No articles match your filters.'}</p>
            </div>
          ) : (
            <div className="panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slatex/10 bg-slatex/5 text-[11px] font-bold uppercase tracking-widest text-slatex/50">
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Views</th>
                      <th className="px-6 py-4 text-center">Featured</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slatex/5">
                    {filtered.map((article) => (
                      <tr key={article.id} className="group transition hover:bg-mint/5">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slatex max-w-[240px] truncate">{article.title}</div>
                          <div className="text-xs font-medium text-slatex/40 mt-1">{article.read_time} min read</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slatex/70">{article.author?.full_name || article.author?.email || "—"}</td>
                        <td className="px-6 py-4">
                          {article.category ? (
                            <span className="rounded-md bg-slatex/5 px-2.5 py-1 text-xs font-semibold text-slatex/70">{article.category.name}</span>
                          ) : (
                            <span className="text-slatex/30">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_COLORS[article.status] || "bg-slate-100 text-slate-500"}`}>
                            {article.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slatex/50 whitespace-nowrap">
                          {article.status === "published" ? formatDate(article.published_at) : formatDate(article.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-slatex/80 tabular-nums">{article.view_count.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center text-lg">{article.is_featured ? "⭐" : <span className="text-slatex/20">•</span>}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                            <Link
                              to={`/articles/${article.id}/edit`}
                              className="rounded-xl px-3 py-1.5 text-xs font-bold text-mint hover:bg-mint/10 transition"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, id: article.id, type: "article" })}
                              className="rounded-xl px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
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
        </div>
      )}

      {/* ── Categories tab ── */}
      {!loading && tab === "categories" && (
        <div className="space-y-4 animate-fade-in-up">
          <form onSubmit={handleCreateCategory} className="panel flex flex-wrap items-end gap-4 p-6">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Name</label>
              <input className="field" placeholder="e.g. Technology" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Slug (auto)</label>
              <input className="field bg-slatex/5" placeholder="auto-generated" value={newCatSlug} onChange={(e) => setNewCatSlug(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[250px]">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Description</label>
              <input className="field" placeholder="Optional brief description" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
            </div>
            <button type="submit" className="rounded-full bg-slatex px-6 py-3 text-sm font-bold tracking-wide text-white shadow hover:bg-slatex/90 transition">
              Add category
            </button>
          </form>

          {categories.length === 0 ? (
             <div className="panel p-12 text-center text-slatex/50 font-medium">No categories. Create one above.</div>
          ) : (
            <div className="panel overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slatex/10 bg-slatex/5 text-[11px] font-bold uppercase tracking-widest text-slatex/50">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center">Articles</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slatex/5">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="group transition hover:bg-mint/5">
                      {editCatId === cat.id ? (
                        <>
                          <td className="px-6 py-3">
                            <input className="field py-2" value={editCatForm.name} onChange={(e) => setEditCatForm({ ...editCatForm, name: e.target.value })} />
                          </td>
                          <td className="px-6 py-3">
                            <input className="field py-2 font-mono text-xs" value={editCatForm.slug} onChange={(e) => setEditCatForm({ ...editCatForm, slug: e.target.value })} />
                          </td>
                          <td className="px-6 py-3">
                            <input className="field py-2" value={editCatForm.description} onChange={(e) => setEditCatForm({ ...editCatForm, description: e.target.value })} />
                          </td>
                          <td className="px-6 py-3 text-center font-medium text-slatex/50">{cat.article_count ?? "—"}</td>
                          <td className="px-6 py-3 text-xs font-medium text-slatex/50">{formatDate(cat.created_at)}</td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={saveEditCategory} className="rounded-xl bg-mint/10 px-4 py-2 text-xs font-bold text-mint hover:bg-mint/20 transition">Save</button>
                              <button onClick={cancelEditCategory} className="rounded-xl bg-slatex/5 px-4 py-2 text-xs font-bold text-slatex/60 hover:bg-slatex/10 transition">Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-bold text-slatex">{cat.name}</td>
                          <td className="px-6 py-4 text-slatex/50 font-mono text-xs">{cat.slug}</td>
                          <td className="px-6 py-4 text-slatex/60 max-w-xs truncate">{cat.description || "—"}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="rounded-full bg-slatex/5 px-3 py-1.5 text-[11px] font-bold tabular-nums text-slatex/70">{cat.article_count ?? 0}</span>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slatex/50">{formatDate(cat.created_at)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <button onClick={() => startEditCategory(cat)} className="rounded-xl px-3 py-1.5 text-xs font-bold text-mint hover:bg-mint/10 transition">Edit</button>
                              <button onClick={() => setDeleteModal({ isOpen: true, id: cat.id, type: "category" })} className="rounded-xl px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition">Delete</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tags tab ── */}
      {!loading && tab === "tags" && (
        <div className="space-y-4 animate-fade-in-up">
          <form onSubmit={handleCreateTag} className="panel flex flex-wrap items-end gap-4 p-6">
            <div className="flex-1 min-w-[200px]">
               <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Name</label>
              <input className="field" placeholder="e.g. JavaScript" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[200px]">
               <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Slug (auto)</label>
              <input className="field bg-slatex/5" placeholder="auto-generated" value={newTagSlug} onChange={(e) => setNewTagSlug(e.target.value)} />
            </div>
            <button type="submit" className="rounded-full bg-slatex px-6 py-3 text-sm font-bold tracking-wide text-white shadow hover:bg-slatex/90 transition">
              Add tag
            </button>
          </form>

          {tags.length === 0 ? (
            <div className="panel p-12 text-center text-slatex/50 font-medium">No tags. Create one above.</div>
          ) : (
            <div className="panel overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slatex/10 bg-slatex/5 text-[11px] font-bold uppercase tracking-widest text-slatex/50">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4 text-center">Articles</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slatex/5">
                  {tags.map((tag) => (
                    <tr key={tag.id} className="group transition hover:bg-mint/5">
                      {editTagId === tag.id ? (
                        <>
                          <td className="px-6 py-3">
                            <input className="field py-2" value={editTagForm.name} onChange={(e) => setEditTagForm({ ...editTagForm, name: e.target.value })} />
                          </td>
                          <td className="px-6 py-3">
                            <input className="field py-2 font-mono text-xs" value={editTagForm.slug} onChange={(e) => setEditTagForm({ ...editTagForm, slug: e.target.value })} />
                          </td>
                          <td className="px-6 py-3 text-center font-medium text-slatex/50">{tag.article_count ?? "—"}</td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={saveEditTag} className="rounded-xl bg-mint/10 px-4 py-2 text-xs font-bold text-mint hover:bg-mint/20 transition">Save</button>
                              <button onClick={cancelEditTag} className="rounded-xl bg-slatex/5 px-4 py-2 text-xs font-bold text-slatex/60 hover:bg-slatex/10 transition">Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-bold text-slatex">{tag.name}</td>
                          <td className="px-6 py-4 text-slatex/50 font-mono text-xs">{tag.slug}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="rounded-full bg-slatex/5 px-3 py-1.5 text-[11px] font-bold tabular-nums text-slatex/70">{tag.article_count ?? 0}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <button onClick={() => startEditTag(tag)} className="rounded-xl px-3 py-1.5 text-xs font-bold text-mint hover:bg-mint/10 transition">Edit</button>
                              <button onClick={() => setDeleteModal({ isOpen: true, id: tag.id, type: "tag" })} className="rounded-xl px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition">Delete</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
