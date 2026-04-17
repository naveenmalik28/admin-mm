import { useEffect, useState } from "react"

import {
  createAdminPlan,
  deleteAdminPlan,
  fetchAdminPlans,
  updateAdminPlan,
} from "../api/admin.api.js"
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx"
import Modal from "../components/ui/Modal.jsx"
import { showToast } from "../components/ui/Toast.jsx"

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  duration_days: "30",
  price: "",
  price_usd: "",
  currency: "INR",
  sort_order: "0",
  is_active: true,
  is_popular: false,
  features: [""],
}

const formatDate = (iso) => {
  if (!iso) return "-"
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")

const toFormState = (plan) => ({
  name: plan?.name || "",
  slug: plan?.slug || "",
  description: plan?.description || "",
  duration_days: String(plan?.duration_days ?? 30),
  price: String(plan?.price ?? ""),
  price_usd: String(plan?.price_usd ?? ""),
  currency: plan?.currency || "INR",
  sort_order: String(plan?.sort_order ?? 0),
  is_active: Boolean(plan?.is_active),
  is_popular: Boolean(plan?.is_popular),
  features: Array.isArray(plan?.features) && plan.features.length > 0 ? plan.features : [""],
})

const toPayload = (form) => ({
  name: form.name.trim(),
  slug: slugify(form.slug || form.name),
  description: form.description.trim(),
  duration_days: Number(form.duration_days || 0),
  price: form.price === "" ? "0" : form.price,
  price_usd: form.price_usd === "" ? "0" : form.price_usd,
  currency: form.currency,
  sort_order: Number(form.sort_order || 0),
  is_active: Boolean(form.is_active),
  is_popular: Boolean(form.is_popular),
  features: form.features.map((feature) => feature.trim()).filter(Boolean),
})

function PlanEditorModal({ open, form, mode, saving, onClose, onChange, onFeatureChange, onAddFeature, onRemoveFeature, onSubmit }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slatex/45 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
      <div className="panel flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="shrink-0 border-b border-slatex/10 bg-slatex/5 px-6 py-5 sm:px-8 sm:py-6">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-mint">{mode === "create" ? "New plan" : "Edit plan"}</div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slatex">
            {mode === "create" ? "Create subscription plan" : "Update subscription plan"}
          </h2>
          <p className="mt-2 text-sm text-slatex/60">Manage dual pricing (INR & USD), feature list, and display settings.</p>
        </div>

        <form className="flex min-h-0 flex-col" onSubmit={onSubmit}>
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-6 pb-20">
            <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Plan name</span>
              <input className="field" value={form.name} onChange={(event) => onChange("name", event.target.value)} placeholder="Growth" required />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Slug</span>
              <input className="field font-mono text-sm" value={form.slug} onChange={(event) => onChange("slug", event.target.value)} placeholder="growth" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Description</span>
              <textarea
                className="field min-h-[90px] resize-y"
                value={form.description}
                onChange={(event) => onChange("description", event.target.value)}
                placeholder="A short tagline that appears under the plan name."
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Duration in days</span>
              <input className="field" type="number" min="1" value={form.duration_days} onChange={(event) => onChange("duration_days", event.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Display order</span>
              <input className="field" type="number" min="0" value={form.sort_order} onChange={(event) => onChange("sort_order", event.target.value)} />
            </label>
            <div className="col-span-1 sm:col-span-2 mt-2">
              <h3 className="mb-4 text-sm font-bold text-slatex border-b border-slatex/10 pb-2">Pricing Details</h3>
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 flex gap-1 text-[11px] font-bold uppercase tracking-widest text-slatex/50">INR price <span className="text-red-500">*</span></span>
                  <input className="field" type="number" min="0" step="0.01" value={form.price} onChange={(event) => onChange("price", event.target.value)} required placeholder="0.00" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">USD price</span>
                  <input className="field" type="number" min="0" step="0.01" value={form.price_usd} onChange={(event) => onChange("price_usd", event.target.value)} placeholder="0.00" />
                </label>
                <label className="block sm:col-span-2 md:col-span-1">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slatex/50">Base Currency</span>
                  <select className="field" value={form.currency} onChange={(event) => onChange("currency", event.target.value)}>
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="grid gap-3 sm:col-span-2 md:grid-cols-2 mt-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slatex/10 bg-slatex/5 px-4 py-3 cursor-pointer transition hover:bg-slatex/10">
                <input type="checkbox" checked={form.is_active} onChange={(event) => onChange("is_active", event.target.checked)} className="h-4 w-4 rounded border-slatex/20 text-mint focus:ring-mint" />
                <span className="text-sm font-semibold text-slatex select-none">Active on frontend</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slatex/10 bg-slatex/5 px-4 py-3 cursor-pointer transition hover:bg-slatex/10">
                <input type="checkbox" checked={form.is_popular} onChange={(event) => onChange("is_popular", event.target.checked)} className="h-4 w-4 rounded border-slatex/20 text-mint focus:ring-mint" />
                <span className="text-sm font-semibold text-slatex select-none">Mark as popular</span>
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-slatex/10 bg-slatex/5 p-5 sm:p-6 mt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slatex">Features</h3>
                <p className="mt-1 text-sm text-slatex/55">Add one feature per row. Blank rows are ignored when you save.</p>
              </div>
              <button
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slatex shadow-sm transition hover:-translate-y-0.5"
                onClick={onAddFeature}
                type="button"
              >
                Add feature
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {form.features.map((feature, index) => (
                <div key={`${index}-${feature}`} className="flex items-center gap-3">
                  <input
                    className="field"
                    value={feature}
                    onChange={(event) => onFeatureChange(index, event.target.value)}
                    placeholder={`Feature ${index + 1}`}
                  />
                  <button
                    className="rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-600 transition hover:bg-red-50"
                    onClick={() => onRemoveFeature(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          </div>

          <div className="shrink-0 border-t border-slatex/10 bg-slatex/5 px-6 py-5 sm:px-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 rounded-b-[32px]">
            <button className="rounded-full px-5 py-3 text-sm font-semibold text-slatex/60 transition hover:bg-slatex/5" onClick={onClose} type="button">
              Cancel
            </button>
            <button
              className="rounded-full bg-slatex px-6 py-3 text-sm font-bold tracking-wide text-white shadow transition hover:bg-slatex/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              {saving ? "Saving..." : mode === "create" ? "Create plan" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editorMode, setEditorMode] = useState("create")
  const [editingId, setEditingId] = useState(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" })

  const reload = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    try {
      const data = await fetchAdminPlans()
      setPlans(data)
    } catch {
      showToast("Failed to load plans.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const openCreateModal = () => {
    setEditorMode("create")
    setEditingId(null)
    setForm(EMPTY_FORM)
    setEditorOpen(true)
  }

  const openEditModal = (plan) => {
    setEditorMode("edit")
    setEditingId(plan.id)
    setForm(toFormState(plan))
    setEditorOpen(true)
  }

  const closeEditor = (force = false) => {
    if (saving && !force) return
    setEditorOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const updateForm = (key, value) => {
    setForm((current) => {
      if (key === "name" && !current.slug) {
        return { ...current, name: value, slug: slugify(value) }
      }
      return { ...current, [key]: value }
    })
  }

  const updateFeature = (index, value) => {
    setForm((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) => (featureIndex === index ? value : feature)),
    }))
  }

  const addFeature = () => {
    setForm((current) => ({ ...current, features: [...current.features, ""] }))
  }

  const removeFeature = (index) => {
    setForm((current) => {
      const next = current.features.filter((_, featureIndex) => featureIndex !== index)
      return { ...current, features: next.length > 0 ? next : [""] }
    })
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = toPayload(form)
      if (editorMode === "create") {
        await createAdminPlan(payload)
        showToast("Plan created successfully.")
      } else {
        await updateAdminPlan(editingId, payload)
        showToast("Plan updated successfully.")
      }
      closeEditor(true)
      await reload(false)
    } catch (error) {
      const fallback = editorMode === "create" ? "Failed to create plan." : "Failed to update plan."
      const message =
        error.response?.data?.slug?.[0] ||
        error.response?.data?.name?.[0] ||
        error.response?.data?.currency?.[0] ||
        error.response?.data?.features?.[0] ||
        error.response?.data?.detail ||
        fallback
      showToast(message, "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteAdminPlan(deleteModal.id)
      setPlans((current) => current.filter((plan) => plan.id !== deleteModal.id))
      showToast("Plan deleted successfully.")
    } catch (error) {
      const message = error.response?.data?.error || "Failed to delete plan."
      showToast(message, "error")
    }
  }

  const toggleFlag = async (plan, field) => {
    const nextValue = !plan[field]
    setPlans((current) => current.map((item) => (item.id === plan.id ? { ...item, [field]: nextValue } : item)))

    try {
      const updated = await updateAdminPlan(plan.id, { [field]: nextValue })
      setPlans((current) => current.map((item) => (item.id === plan.id ? { ...item, ...updated } : item)))
    } catch {
      setPlans((current) => current.map((item) => (item.id === plan.id ? { ...item, [field]: plan[field] } : item)))
      showToast(`Failed to update ${field.replaceAll("_", " ")}.`, "error")
    }
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        title="Delete plan?"
        message={`Delete ${deleteModal.name || "this plan"}? Plans with subscriptions cannot be removed.`}
        onConfirm={handleDelete}
        confirmText="Delete"
      />

      <PlanEditorModal
        open={editorOpen}
        form={form}
        mode={editorMode}
        saving={saving}
        onClose={closeEditor}
        onChange={updateForm}
        onFeatureChange={updateFeature}
        onAddFeature={addFeature}
        onRemoveFeature={removeFeature}
        onSubmit={handleSave}
      />

      <section className="panel p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.32em] text-mint">Subscription setup</div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">Plans</h1>
            <p className="mt-2 max-w-2xl text-sm text-slatex/60">
              Create and maintain the subscription plans that appear on the public pricing page, including dual pricing for INR and USD.
            </p>
          </div>
          <button
            className="rounded-full bg-slatex px-6 py-3 text-sm font-bold tracking-wide text-white shadow transition hover:-translate-y-0.5 hover:bg-slatex/90"
            onClick={openCreateModal}
            type="button"
          >
            Create plan
          </button>
        </div>
      </section>

      {loading ? (
        <LoadingSpinner label="Loading plans" />
      ) : plans.length === 0 ? (
        <div className="panel flex min-h-[320px] flex-col items-center justify-center px-8 py-16 text-center">
          <div className="rounded-full bg-slatex/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-slatex/40">No plans yet</div>
          <h2 className="mt-5 text-2xl font-bold text-slatex">Create your first plan</h2>
          <p className="mt-2 max-w-md text-sm text-slatex/55">Add plan duration, INR and USD pricing, and the features you want to surface on the frontend.</p>
          <button
            className="mt-6 rounded-full bg-mint px-6 py-3 text-sm font-bold tracking-wide text-white shadow transition hover:-translate-y-0.5 hover:bg-mint/90"
            onClick={openCreateModal}
            type="button"
          >
            Add plan
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in-up">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="panel border-b-4 border-b-mint/50 p-6">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slatex/50">Total plans</div>
              <div className="mt-3 text-4xl font-black text-slatex">{plans.length}</div>
            </div>
            <div className="panel border-b-4 border-b-emerald-400/70 p-6">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slatex/50">Active plans</div>
              <div className="mt-3 text-4xl font-black text-emerald-600">{plans.filter((plan) => plan.is_active).length}</div>
            </div>
            <div className="panel border-b-4 border-b-coral/60 p-6">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slatex/50">Popular highlight</div>
              <div className="mt-3 text-lg font-black text-slatex">{plans.find((plan) => plan.is_popular)?.name || "None selected"}</div>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slatex/10 bg-slatex/5 text-[11px] font-bold uppercase tracking-widest text-slatex/50">
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4 text-right">Duration</th>
                    <th className="px-6 py-4 text-right">INR</th>
                    <th className="px-6 py-4 text-right">USD</th>
                    <th className="px-6 py-4 text-center">Features</th>
                    <th className="px-6 py-4 text-center">Subscribers</th>
                    <th className="px-6 py-4 text-center">Active</th>
                    <th className="px-6 py-4 text-center">Popular</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slatex/5">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="group transition hover:bg-mint/5">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-3 w-3 rounded-full bg-mint/60" />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-bold text-slatex">{plan.name}</div>
                              <span className="rounded-full bg-slatex/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slatex/55">
                                #{plan.sort_order}
                              </span>
                            </div>
                            <div className="mt-1 text-xs font-medium text-slatex/45">{plan.slug}</div>
                            <div className="mt-2 max-w-sm text-sm text-slatex/60">{plan.description || "No description added."}</div>
                            <div className="mt-2 text-xs font-medium text-slatex/40">Created {formatDate(plan.created_at)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slatex tabular-nums">{plan.duration_days} days</td>
                      <td className="px-6 py-4 text-right font-semibold text-slatex tabular-nums">INR {plan.price}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slatex tabular-nums">USD {plan.price_usd}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="rounded-full bg-slatex/5 px-3 py-1.5 text-[11px] font-bold text-slatex/70">{plan.features?.length ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="rounded-full bg-slatex/5 px-3 py-1.5 text-[11px] font-bold text-slatex/70">{plan.subscription_count ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
                            plan.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          }`}
                          onClick={() => toggleFlag(plan, "is_active")}
                          type="button"
                        >
                          {plan.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
                            plan.is_popular ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          }`}
                          onClick={() => toggleFlag(plan, "is_popular")}
                          type="button"
                        >
                          {plan.is_popular ? "Popular" : "Standard"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <button
                            className="rounded-xl px-3 py-1.5 text-xs font-bold text-mint transition hover:bg-mint/10"
                            onClick={() => openEditModal(plan)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-xl px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                            onClick={() => setDeleteModal({ isOpen: true, id: plan.id, name: plan.name })}
                            type="button"
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
        </div>
      )}
    </section>
  )
}
