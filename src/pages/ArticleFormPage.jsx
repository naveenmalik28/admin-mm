import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ArticleEditor from "../components/ArticleEditor.jsx"

import {
  fetchAdminArticle,
  createAdminArticle,
  updateAdminArticle,
  fetchAdminCategories,
  fetchAdminTags,
  createAdminTag,
  uploadAdminImage,
} from "../api/admin.api.js"

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  content: "",
  category_id: "",
  tag_ids: [],
  cover_image: "",
  status: "draft",
  is_featured: false,
}

export default function ArticleFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [newTagName, setNewTagName] = useState("")
  const [creatingTag, setCreatingTag] = useState(false)

  useEffect(() => {
    const fetchMeta = Promise.all([fetchAdminCategories(), fetchAdminTags()]).then(([c, t]) => {
      setCategories(c)
      setTags(t)
    })

    if (isEdit) {
      Promise.all([fetchMeta, fetchAdminArticle(id)])
        .then(([, article]) => {
          setForm({
            title: article.title || "",
            excerpt: article.excerpt || "",
            content: article.content || "",
            category_id: article.category?.id ?? "",
            tag_ids: (article.tags || []).map((t) => t.id),
            cover_image: article.cover_image || "",
            status: article.status || "draft",
            is_featured: article.is_featured || false,
          })
        })
        .catch(() => setError("Failed to load article."))
        .finally(() => setLoading(false))
    } else {
      fetchMeta.finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (statusOverride) => {
    setError("")
    if (!form.title.trim()) {
      setError("Title is required.")
      return
    }
    if (!form.content.trim()) {
      setError("Content is required.")
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        status: statusOverride || form.status,
        category_id: form.category_id || null,
        tag_ids: form.tag_ids,
      }
      if (isEdit) {
        await updateAdminArticle(id, payload)
      } else {
        await createAdminArticle(payload)
      }
      navigate("/articles")
    } catch (err) {
      const detail = err.response?.data
      if (typeof detail === "object") {
        setError(Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | "))
      } else {
        setError("Failed to save article. Please try again.")
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = (tagId) => {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }))
  }

  const handleCreateTag = async () => {
    const name = newTagName.trim()
    if (!name) return

    setCreatingTag(true)
    setError("")
    try {
      const tag = await createAdminTag({ name })
      setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)))
      setForm((prev) => ({ ...prev, tag_ids: [...prev.tag_ids, tag.id] }))
      setNewTagName("")
    } catch (err) {
      const detail = err.response?.data
      if (typeof detail === "object") {
        setError(Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | "))
      } else {
        setError("Failed to create tag.")
      }
    } finally {
      setCreatingTag(false)
    }
  }

  if (loading) return <div className="panel p-8 text-center text-slatex/50">Loading…</div>

  return (
    <section className="space-y-6">
      {/* Title bar */}
      <div className="panel p-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/articles")} className="rounded-xl bg-slatex/5 px-3 py-2 text-sm font-semibold hover:bg-slatex/10 transition">
            ← Back
          </button>
          <div>
            <div className="text-xs uppercase tracking-[0.32em] text-mint">{isEdit ? "Edit article" : "Create article"}</div>
            <h1 className="mt-1 text-3xl font-semibold">{isEdit ? "Update content" : "Craft new content"}</h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="panel border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Main editor */}
        <div className="space-y-4">
          {/* Title */}
          <div className="panel p-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slatex/50">Title</label>
            <input
              className="field text-lg font-semibold"
              placeholder="Article title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
          </div>

          {/* Excerpt */}
          <div className="panel p-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slatex/50">Excerpt</label>
            <textarea
              className="field min-h-[80px] resize-y"
              placeholder="A short summary that appears in article listings…"
              value={form.excerpt}
              onChange={(e) => setField("excerpt", e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="pt-2">
            <ArticleEditor value={form.content} onChange={(html) => setField("content", html)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="panel p-5 space-y-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slatex/50">Actions</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSubmit("draft")}
                disabled={saving}
                className="w-full rounded-full bg-slatex px-4 py-3 text-sm font-semibold text-white transition hover:bg-slatex/90 disabled:opacity-50"
              >
                {saving ? "Saving…" : isEdit ? "Save as draft" : "Create draft"}
              </button>
              <button
                onClick={() => handleSubmit("published")}
                disabled={saving}
                className="w-full rounded-full bg-mint px-4 py-3 text-sm font-semibold text-white transition hover:bg-mint/90 disabled:opacity-50"
              >
                {saving ? "Publishing…" : isEdit ? "Save & publish" : "Create & publish"}
              </button>
              {isEdit && form.status === "published" && (
                <button
                  onClick={() => handleSubmit("archived")}
                  disabled={saving}
                  className="w-full rounded-full bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-200 disabled:opacity-50"
                >
                  Archive
                </button>
              )}
            </div>
          </div>

          {/* Cover image */}
          <div className="panel p-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slatex/50">Cover image</label>
            <input 
              type="file" 
              accept="image/*"
              className="mb-3 block w-full text-xs text-slatex/60 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-mint/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-mint hover:file:bg-mint/20"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  setSaving(true)
                  try {
                    const { url } = await uploadAdminImage(e.target.files[0])
                    setField("cover_image", url)
                  } catch {
                    alert("Failed to upload image")
                  } finally {
                    setSaving(false)
                  }
                }
              }}
            />
            {form.cover_image && (
              <img
                src={form.cover_image}
                alt="Cover preview"
                className="mt-3 w-full rounded-xl object-cover max-h-48 shadow"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <div className="mt-4">
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-slatex/40">Or paste URL</label>
              <input
                className="field text-xs py-2"
                placeholder="https://..."
                value={form.cover_image}
                onChange={(e) => setField("cover_image", e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="panel p-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slatex/50">Category</label>
            <select
              className="field"
              value={form.category_id}
              onChange={(e) => setField("category_id", e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="panel p-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slatex/50">Tags</label>
            <div className="mb-4 flex gap-2">
              <input
                className="field"
                placeholder="Create and attach a new tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleCreateTag()
                  }
                }}
              />
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={creatingTag}
                className="rounded-full bg-slatex px-4 py-2 text-xs font-semibold text-white transition hover:bg-slatex/90 disabled:opacity-50"
              >
                {creatingTag ? "Adding..." : "Add tag"}
              </button>
            </div>
            {tags.length === 0 ? (
              <p className="text-xs text-slatex/40">No tags available. Create them in the Articles → Tags tab.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      form.tag_ids.includes(tag.id)
                        ? "bg-mint text-white shadow"
                        : "bg-slatex/5 text-slatex/60 hover:bg-slatex/10"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Featured */}
          <div className="panel p-5">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setField("is_featured", e.target.checked)}
                className="h-4 w-4 rounded accent-mint"
              />
              <span className="text-sm font-semibold">Mark as featured</span>
            </label>
            <p className="mt-1 text-xs text-slatex/40">Featured articles are highlighted on the homepage.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
