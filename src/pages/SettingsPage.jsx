import { useEffect, useState } from "react"
import { fetchSiteSettings, updateSiteSettings } from "../api/admin.api.js"
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx"
import { showToast } from "../components/ui/Toast.jsx"

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
  const djangoAdminUrl =
    import.meta.env.VITE_DJANGO_ADMIN_URL ||
    (import.meta.env.DEV ? "http://localhost:8000/admin/" : "https://api.magnivel.com/admin/")
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSiteSettings()
      .then((data) => setForm(data))
      .catch(() => showToast("Failed to load settings.", "error"))
      .finally(() => setLoading(false))
  }, [])

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateSiteSettings(form)
      setForm(result)
      showToast("Settings saved successfully!")
    } catch (err) {
      const detail = err.response?.data
      if (typeof detail === "object") {
        showToast(Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | "), "error")
      } else {
        showToast("Failed to save settings.", "error")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <section className="panel p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-mint font-semibold">Configuration</div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Platform Settings</h1>
        <p className="mt-2 text-sm text-slatex/60">Manage your site identity, social links, SEO defaults, and more.</p>
      </section>

      {loading && <LoadingSpinner />}

      {!loading && (
        <div className="max-w-4xl space-y-6 animate-fade-in-up">
          {FIELD_GROUPS.map((group) => (
            <section key={group.title} className="panel p-0 overflow-hidden">
              <div className="border-b border-slatex/10 bg-slatex/5 px-8 py-5">
                <h2 className="text-lg font-bold text-slatex">{group.title}</h2>
                <p className="mt-1 text-sm text-slatex/50">{group.description}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 p-8">
                {group.fields.map((field) => (
                  <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        className="field min-h-[100px] resize-y"
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

          {/* Save & External panel */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="panel p-8 flex flex-col justify-center gap-4 border-l-4 border-l-mint">
              <div>
                <h2 className="text-xl font-bold">Save changes</h2>
                <p className="mt-1 text-sm text-slatex/60">Publish these settings to production immediately.</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-max rounded-full bg-mint px-10 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-mint/20 transition-all hover:-translate-y-0.5 hover:shadow-mint/40 hover:bg-mint/90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save all settings"}
              </button>
            </section>

            {/* Django admin link */}
            <section className="panel p-8 flex flex-col justify-center gap-4 bg-slatex text-white">
              <div>
                <h2 className="text-xl font-bold">Advanced Management</h2>
                <p className="mt-1 text-sm text-white/60">For developer-level model editing and database access.</p>
              </div>
              <a
                className="w-max inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-bold text-slatex transition hover:bg-white/90"
                href={djangoAdminUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open Django admin ↗
              </a>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
