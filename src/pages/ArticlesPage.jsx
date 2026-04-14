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

  // Inline edit state
  const [editCatId, setEditCatId] = useState(null)
  const [editCatForm, setEditCatForm] = useState({ name: "", slug: "", description: "" })
  const [editTagId, setEditTagId] = useState(null)
  const [editTagForm, setEditTagForm] = useState({ name: "", slug: "" })

  const reload = (showLoading = true) => {
    if (showLoading) setLoading(true)
    Promise.all([fetchAdminArticles(), fetchAdminCategories(), fetchAdminTags()])
      .then(([a, c, t]) => {
        setArticles(a)
        setCategories(c)
        setTags(t)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload(false)
  }, [])

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Delete this article permanently?")) return
    await deleteAdminArticle(id)
    setArticles((prev) => prev.filter((a) => a.id !== id))
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
      reload()
    } catch (error) {
      const msg = error.response?.data?.slug?.[0] || error.response?.data?.name?.[0] || "Failed to create category. It might already exist."
      alert(msg)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return
    await deleteAdminCategory(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
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
      reload(false)
    } catch (error) {
      const msg = error.response?.data?.slug?.[0] || error.response?.data?.name?.[0] || "Failed to update category."
      alert(msg)
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
      reload()
    } catch (error) {
      const msg = error.response?.data?.slug?.[0] || error.response?.data?.name?.[0] || "Failed to create tag. It might already exist."
      alert(msg)
    }
  }

  const handleDeleteTag = async (id) => {
    if (!window.confirm("Delete this tag?")) return
    await deleteAdminTag(id)
    setTags((prev) => prev.filter((t) => t.id !== id))
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
      reload(false)
    } catch (error) {
      const msg = error.response?.data?.slug?.[0] || error.response?.data?.name?.[0] || "Failed to update tag."
      alert(msg)
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
    <section className="space-y-6">
      {/* Title bar */}
      <div className="panel p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-mint">Content management</div>
        <h1 className="mt-4 text-4xl font-semibold">Articles & Topics</h1>
        <p className="mt-2 text-sm text-slatex/60">Create, edit & manage all articles, categories, and tags for your platform.</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2">
        {["articles", "categories", "tags"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition ${
              tab === t ? "bg-slatex text-white shadow-card" : "bg-white/60 text-slatex/60 hover:bg-white/80"
            }`}
          >
            {t} {t === "articles" ? `(${articles.length})` : t === "categories" ? `(${categories.length})` : `(${tags.length})`}
          </button>
        ))}
      </div>

      {loading && <div className="panel p-6 text-center text-slatex/50">Loading…</div>}

      {/* ── Articles tab ── */}
      {!loading && tab === "articles" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="panel flex flex-wrap items-center gap-3 p-4">
            <input
              className="field flex-1"
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
              className="inline-flex items-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-mint/90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New article
            </Link>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="panel p-8 text-center text-slatex/50">
              {articles.length === 0 ? 'No articles yet. Click "New article" to create one.' : "No articles match your filters."}
            </div>
          ) : (
            <div className="panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slatex/10 text-xs uppercase tracking-wider text-slatex/50">
                      <th className="px-5 py-4">Title</th>
                      <th className="px-5 py-4">Author</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4 text-right">Views</th>
                      <th className="px-5 py-4 text-center">Featured</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((article) => (
                      <tr key={article.id} className="border-b border-slatex/5 last:border-0 hover:bg-mint/5 transition">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slatex max-w-xs truncate">{article.title}</div>
                          <div className="text-xs text-slatex/40 mt-0.5">{article.read_time} min read</div>
                        </td>
                        <td className="px-5 py-4 text-slatex/60">{article.author?.full_name || article.author?.email || "—"}</td>
                        <td className="px-5 py-4">
                          {article.category ? (
                            <span className="rounded-full bg-mint/10 px-3 py-1 text-xs font-semibold text-mint">{article.category.name}</span>
                          ) : (
                            <span className="text-slatex/30">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[article.status] || "bg-slate-100 text-slate-500"}`}>
                            {article.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slatex/50 whitespace-nowrap">
                          {article.status === "published" ? formatDate(article.published_at) : formatDate(article.created_at)}
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums">{article.view_count.toLocaleString()}</td>
                        <td className="px-5 py-4 text-center">{article.is_featured ? "⭐" : "—"}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/articles/${article.id}/edit`}
                              className="rounded-xl bg-slatex/5 px-3 py-1.5 text-xs font-semibold text-slatex hover:bg-slatex/10 transition"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteArticle(article.id)}
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
        </div>
      )}

      {/* ── Categories tab ── */}
      {!loading && tab === "categories" && (
        <div className="space-y-4">
          <form onSubmit={handleCreateCategory} className="panel flex flex-wrap items-end gap-3 p-5">
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slatex/50">Name</label>
              <input className="field" placeholder="e.g. Technology" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slatex/50">Slug (auto)</label>
              <input className="field" placeholder="auto-generated" value={newCatSlug} onChange={(e) => setNewCatSlug(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slatex/50">Description</label>
              <input className="field" placeholder="Optional brief description" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
            </div>
            <button type="submit" className="rounded-full bg-mint px-5 py-3 text-sm font-semibold text-white shadow hover:bg-mint/90 transition">
              Add category
            </button>
          </form>

          {categories.length === 0 ? (
            <div className="panel p-8 text-center text-slatex/50">No categories. Create one above.</div>
          ) : (
            <div className="panel overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slatex/10 text-xs uppercase tracking-wider text-slatex/50">
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Slug</th>
                    <th className="px-5 py-4">Description</th>
                    <th className="px-5 py-4 text-center">Articles</th>
                    <th className="px-5 py-4">Created</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-slatex/5 last:border-0 hover:bg-mint/5 transition">
                      {editCatId === cat.id ? (
                        <>
                          <td className="px-5 py-3">
                            <input className="field text-sm py-2" value={editCatForm.name} onChange={(e) => setEditCatForm({ ...editCatForm, name: e.target.value })} />
                          </td>
                          <td className="px-5 py-3">
                            <input className="field text-xs py-2 font-mono" value={editCatForm.slug} onChange={(e) => setEditCatForm({ ...editCatForm, slug: e.target.value })} />
                          </td>
                          <td className="px-5 py-3">
                            <input className="field text-sm py-2" value={editCatForm.description} onChange={(e) => setEditCatForm({ ...editCatForm, description: e.target.value })} />
                          </td>
                          <td className="px-5 py-3 text-center text-slatex/50">{cat.article_count ?? "—"}</td>
                          <td className="px-5 py-3 text-xs text-slatex/50">{formatDate(cat.created_at)}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={saveEditCategory} className="rounded-xl bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint hover:bg-mint/20 transition">Save</button>
                              <button onClick={cancelEditCategory} className="rounded-xl bg-slatex/5 px-3 py-1.5 text-xs font-semibold text-slatex/60 hover:bg-slatex/10 transition">Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-4 font-semibold">{cat.name}</td>
                          <td className="px-5 py-4 text-slatex/50 font-mono text-xs">{cat.slug}</td>
                          <td className="px-5 py-4 text-slatex/60 max-w-xs truncate">{cat.description || "—"}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="rounded-full bg-slatex/5 px-2.5 py-1 text-xs font-semibold tabular-nums">{cat.article_count ?? 0}</span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slatex/50">{formatDate(cat.created_at)}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => startEditCategory(cat)} className="rounded-xl bg-slatex/5 px-3 py-1.5 text-xs font-semibold text-slatex hover:bg-slatex/10 transition">Edit</button>
                              <button onClick={() => handleDeleteCategory(cat.id)} className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition">Delete</button>
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
        <div className="space-y-4">
          <form onSubmit={handleCreateTag} className="panel flex flex-wrap items-end gap-3 p-5">
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slatex/50">Name</label>
              <input className="field" placeholder="e.g. JavaScript" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slatex/50">Slug (auto)</label>
              <input className="field" placeholder="auto-generated" value={newTagSlug} onChange={(e) => setNewTagSlug(e.target.value)} />
            </div>
            <button type="submit" className="rounded-full bg-mint px-5 py-3 text-sm font-semibold text-white shadow hover:bg-mint/90 transition">
              Add tag
            </button>
          </form>

          {tags.length === 0 ? (
            <div className="panel p-8 text-center text-slatex/50">No tags. Create one above.</div>
          ) : (
            <div className="panel overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slatex/10 text-xs uppercase tracking-wider text-slatex/50">
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Slug</th>
                    <th className="px-5 py-4 text-center">Articles</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => (
                    <tr key={tag.id} className="border-b border-slatex/5 last:border-0 hover:bg-mint/5 transition">
                      {editTagId === tag.id ? (
                        <>
                          <td className="px-5 py-3">
                            <input className="field text-sm py-2" value={editTagForm.name} onChange={(e) => setEditTagForm({ ...editTagForm, name: e.target.value })} />
                          </td>
                          <td className="px-5 py-3">
                            <input className="field text-xs py-2 font-mono" value={editTagForm.slug} onChange={(e) => setEditTagForm({ ...editTagForm, slug: e.target.value })} />
                          </td>
                          <td className="px-5 py-3 text-center text-slatex/50">{tag.article_count ?? "—"}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={saveEditTag} className="rounded-xl bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint hover:bg-mint/20 transition">Save</button>
                              <button onClick={cancelEditTag} className="rounded-xl bg-slatex/5 px-3 py-1.5 text-xs font-semibold text-slatex/60 hover:bg-slatex/10 transition">Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-4 font-semibold">{tag.name}</td>
                          <td className="px-5 py-4 text-slatex/50 font-mono text-xs">{tag.slug}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="rounded-full bg-slatex/5 px-2.5 py-1 text-xs font-semibold tabular-nums">{tag.article_count ?? 0}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => startEditTag(tag)} className="rounded-xl bg-slatex/5 px-3 py-1.5 text-xs font-semibold text-slatex hover:bg-slatex/10 transition">Edit</button>
                              <button onClick={() => handleDeleteTag(tag.id)} className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition">Delete</button>
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
