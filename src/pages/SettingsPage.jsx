import { useEffect, useState } from "react"
import { fetchSiteSettings, updateSiteSettings } from "../api/admin.api.js"

const FIELD_GROUPS = [
  {
    title: "General",
    description: "Core identity of your platform.",
    fields: [
      { key: "site_name", label: "Site name", type: "text", placeholder: "Magnivel Media" },
      { key: "tagline", label: "Tagline", type: "text", placeholder: "A global thought-sharing publication" },
      { key: "description", label: "Description", type: "textarea", placeholder: "A brief description of your platform…" },
      { key: "about_text", label: "About text", type: "textarea", placeholder: "Longer about section content…" },
      { key: "contact_email", label: "Contact email", type: "email", placeholder: "hello@magnivelmedia.com" },
    ],
  },
  {
    title: "Social Links",
    description: "Connect your social media profiles.",
    fields: [
      { key: "twitter_url", label: "Twitter / X", type: "url", placeholder: "https://twitter.com/…" },
      { key: "github_url", label: "GitHub", type: "url", placeholder: "https://github.com/…" },
      { key: "linkedin_url", label: "LinkedIn", type: "url", placeholder: "https://linkedin.com/in/…" },
      { key: "instagram_url", label: "Instagram", type: "url", placeholder: "https://instagram.com/…" },
    ],
  },
  {
    title: "SEO Defaults",
    description: "Fallback meta tags used when pages don't specify their own.",
    fields: [
      { key: "default_meta_description", label: "Default meta description", type: "textarea", placeholder: "Default description for search engines…" },
      { key: "default_og_image", label: "Default OG image URL", type: "url", placeholder: "https://…/og-image.jpg" },
    ],
  },
]

export default function SettingsPage() {
  const djangoAdminUrl = import.meta.env.VITE_DJANGO_ADMIN_URL || "http://localhost:8000/admin/"
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSiteSettings()
      .then((data) => setForm(data))
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false))
  }, [])

  const setField = (key, value) => {
    setSaved(false)
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const result = await updateSiteSettings(form)
      setForm(result)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      const detail = err.response?.data
      if (typeof detail === "object") {
        setError(Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | "))
      } else {
        setError("Failed to save settings.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="panel p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-mint">Configuration</div>
        <h1 className="mt-4 text-4xl font-semibold">Platform Settings</h1>
        <p className="mt-2 text-sm text-slatex/60">Manage your site identity, social links, SEO defaults, and more.</p>
      </section>

      {loading && <div className="panel p-6 text-center text-slatex/50">Loading settings…</div>}

      {error && (
        <div className="panel border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && (
        <>
          {FIELD_GROUPS.map((group) => (
            <section key={group.title} className="panel p-6 space-y-5">
              <div>
                <h2 className="text-xl font-semibold">{group.title}</h2>
                <p className="mt-1 text-sm text-slatex/50">{group.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {group.fields.map((field) => (
                  <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slatex/50">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        className="field min-h-[90px] resize-y"
                        placeholder={field.placeholder}
                        value={form[field.key] || ""}
                        onChange={(e) => setField(field.key, e.target.value)}
                      />
                    ) : (
                      <input
                        type={field.type}
                        className="field"
                        placeholder={field.placeholder}
                        value={form[field.key] || ""}
                        onChange={(e) => setField(field.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Save button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-mint px-8 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-mint/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save all settings"}
            </button>
            {saved && (
              <span className="text-sm font-semibold text-emerald-600 animate-pulse">✓ Settings saved successfully</span>
            )}
          </div>

          {/* Django admin link */}
          <section className="panel p-6">
            <h2 className="text-xl font-semibold">Django Admin</h2>
            <p className="mt-2 text-sm text-slatex/60">For advanced model editing and database management, use the Django admin interface.</p>
            <a
              className="mt-4 inline-flex rounded-full bg-slatex px-5 py-3 text-sm font-semibold text-white transition hover:bg-slatex/90"
              href={djangoAdminUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open Django admin ↗
            </a>
          </section>
        </>
      )}
    </div>
  )
}
