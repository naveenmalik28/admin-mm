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
} from "../api/admin.api.js"
import { showToast } from "../components/ui/Toast.jsx"
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx"

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  content: "",
  category_id: "",
  tag_ids: [],
  cover_image: "",
  cover_image_file: null,
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
            cover_image_file: null,
            status: article.status || "draft",
            is_featured: article.is_featured || false,
          })
        })
        .catch(() => showToast("Failed to load article.", "error"))
        .finally(() => setLoading(false))
    } else {
      fetchMeta.finally(() => setLoading(false))
    }
  }, [id, isEdit])

  useEffect(() => {
    return () => {
      if (form.cover_image?.startsWith("blob:")) {
        URL.revokeObjectURL(form.cover_image)
      }
    }
  }, [form.cover_image])

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (statusOverride) => {
    if (!form.title.trim()) {
      showToast("Title is required.", "error")
      return
    }
    if (!form.content.trim()) {
      showToast("Content is required.", "error")
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
        showToast("Article updated successfully!")
      } else {
        await createAdminArticle(payload)
        showToast("Article created successfully!")
      }
      navigate("/articles")
    } catch (err) {
      const detail = err.response?.data
      if (typeof detail === "object") {
        showToast(Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | "), "error")
      } else {
        showToast("Failed to save article. Please try again.", "error")
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
    try {
      const tag = await createAdminTag({ name })
      setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)))
      setForm((prev) => ({ ...prev, tag_ids: [...prev.tag_ids, tag.id] }))
      setNewTagName("")
      showToast("Tag added")
    } catch (err) {
      const detail = err.response?.data
      if (typeof detail === "object") {
        showToast(Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | "), "error")
      } else {
        showToast("Failed to create tag.", "error")
      }
    } finally {
      setCreatingTag(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <section className="space-y-6 animate-fade-in-up">
      {/* Title bar */}
      <div className="panel p-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/articles")} className="rounded-full bg-slatex/5 p-3 text-sm font-semibold hover:bg-slatex/10 transition hover:-translate-x-1">
            ←
          </button>
          <div>
            <div className="text-xs uppercase tracking-[0.32em] text-mint font-semibold">{isEdit ? "Edit article" : "Create article"}</div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{isEdit ? "Update content" : "Craft new content"}</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Main editor */}
        <div className="space-y-4">
          {/* Title */}
          <div className="panel p-6">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Title</label>
            <input
              className="field text-xl font-bold placeholder:font-normal"
              placeholder="Article title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
          </div>

          {/* Excerpt */}
          <div className="panel p-6">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Excerpt</label>
            <textarea
              className="field min-h-[90px] resize-y"
              placeholder="A short summary that appears in article listings…"
              value={form.excerpt}
              onChange={(e) => setField("excerpt", e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="panel p-2 shadow-lg ring-1 ring-slatex/5">
            <ArticleEditor value={form.content} onChange={(html) => setField("content", html)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="panel sticky top-4 p-6 space-y-4 z-10 shadow-xl">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Actions</label>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSubmit("draft")}
                disabled={saving}
                className="w-full rounded-full bg-slatex px-4 py-3.5 text-sm font-bold tracking-wide text-white transition-all hover:bg-slatex/90 disabled:opacity-50"
              >
                {saving ? "Saving…" : isEdit ? "Save as draft" : "Create draft"}
              </button>
              <button
                onClick={() => handleSubmit("published")}
                disabled={saving}
                className="w-full rounded-full bg-mint px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-mint/20 transition-all hover:-translate-y-0.5 hover:shadow-mint/40 hover:bg-mint/90 disabled:opacity-50"
              >
                {saving ? "Publishing…" : isEdit ? "Save & publish" : "Create & publish"}
              </button>
              {isEdit && form.status === "published" && (
                <button
                  onClick={() => handleSubmit("archived")}
                  disabled={saving}
                  className="w-full rounded-full bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                >
                  Archive
                </button>
              )}
            </div>
          </div>

          {/* Cover image */}
          <div className="panel p-6">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Cover image</label>
            <div className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed ${form.cover_image ? 'border-transparent' : 'border-slatex/10'} bg-slatex/5 p-6 hover:bg-slatex/10 transition`}>
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 z-10 w-full h-full cursor-pointer opacity-0"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const previewUrl = URL.createObjectURL(e.target.files[0])
                    setForm((prev) => ({
                      ...prev,
                      cover_image: previewUrl,
                      cover_image_file: e.target.files[0],
                    }))
                    showToast("Image selected. It will upload when you save.")
                  }
                }}
              />
              {form.cover_image ? (
                <img
                  src={form.cover_image}
                  alt="Cover preview"
                  className="w-full rounded-xl object-cover max-h-48 shadow"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="text-center">
                  <div className="text-3xl mb-2 text-slatex/30">📸</div>
                  <span className="text-xs font-bold text-mint">Click or drag image to upload</span>
                  <p className="mt-2 text-[11px] text-slatex/45">The backend uploads it to Cloudinary and stores the URL in Neon when you save.</p>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slatex/40">Or paste URL</label>
              <input
                className="field text-xs py-2 bg-transparent"
                placeholder="https://..."
                value={form.cover_image}
                onChange={(e) => setForm((prev) => ({ ...prev, cover_image: e.target.value, cover_image_file: null }))}
              />
            </div>
          </div>

          {/* Category */}
          <div className="panel p-6">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Category</label>
            <div className="relative">
              <select
                className="field appearance-none"
                value={form.category_id}
                onChange={(e) => setField("category_id", e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slatex/40">▼</div>
            </div>
          </div>

          {/* Tags */}
          <div className="panel p-6">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Tags</label>
            <div className="mb-4 flex gap-2">
              <input
                className="field bg-slatex/5"
                placeholder="Create & attach"
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
                className="rounded-full bg-slatex px-4 py-2 text-xs font-bold tracking-wide text-white transition hover:bg-slatex/90 disabled:opacity-50"
              >
                {creatingTag ? "..." : "+"}
              </button>
            </div>
            {tags.length === 0 ? (
              <p className="text-xs text-slatex/40">No tags available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition hover:scale-105 active:scale-95 ${
                      form.tag_ids.includes(tag.id)
                        ? "bg-mint text-white shadow-md shadow-mint/20"
                        : "bg-slatex/5 text-slatex/60 hover:bg-slatex/10 hover:text-slatex"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Featured */}
          <div className="panel p-6">
            <label className="flex cursor-pointer items-center gap-3 group">
              <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${form.is_featured ? 'border-mint bg-mint' : 'border-slatex/20 bg-transparent group-hover:border-slatex/40'}`}>
                {form.is_featured && <span className="text-white text-xs">✓</span>}
              </div>
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setField("is_featured", e.target.checked)}
                className="hidden"
              />
              <span className="text-sm font-bold text-slatex">Mark as featured</span>
            </label>
            <p className="mt-2 text-xs text-slatex/40">Featured articles are highlighted on the homepage carousel.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
