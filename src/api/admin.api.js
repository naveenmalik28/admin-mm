import api from "./axios.js"

const unwrapList = (response) => response.data?.results ?? response.data
const isFile = (value) => typeof File !== "undefined" && value instanceof File
const isPreviewUrl = (value) => typeof value === "string" && value.startsWith("blob:")

const toArticleRequestBody = (payload = {}) => {
  if (!isFile(payload.cover_image_file)) {
    const jsonPayload = { ...payload }
    if (isPreviewUrl(jsonPayload.cover_image)) {
      delete jsonPayload.cover_image
    }
    if (!jsonPayload.cover_image_file) {
      delete jsonPayload.cover_image_file
    }
    return jsonPayload
  }

  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item))
      return
    }

    if (key === "cover_image" && isPreviewUrl(value)) {
      return
    }

    if (value === undefined || value === null) {
      return
    }

    formData.append(key, value)
  })

  return formData
}

const requestConfig = (body) =>
  body instanceof FormData
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : undefined

// Summary
export const fetchAdminSummary = async () => (await api.get("/auth/admin/summary/")).data

// Users
export const fetchAdminUsers = async () => unwrapList(await api.get("/auth/admin/users/"))

// Articles
export const fetchAdminArticles = async () => unwrapList(await api.get("/auth/admin/articles/"))
export const fetchAdminArticle = async (id) => (await api.get(`/auth/admin/articles/${id}/`)).data
export const createAdminArticle = async (payload) => {
  const body = toArticleRequestBody(payload)
  return (await api.post("/auth/admin/articles/create/", body, requestConfig(body))).data
}
export const updateAdminArticle = async (id, payload) => {
  const body = toArticleRequestBody(payload)
  return (await api.patch(`/auth/admin/articles/${id}/`, body, requestConfig(body))).data
}
export const deleteAdminArticle = async (id) => (await api.delete(`/auth/admin/articles/${id}/`)).data

// Categories
export const fetchAdminCategories = async () => unwrapList(await api.get("/categories/"))
export const createAdminCategory = async (payload) => (await api.post("/categories/", payload)).data
export const updateAdminCategory = async (id, payload) => (await api.put(`/categories/${id}/`, payload)).data
export const deleteAdminCategory = async (id) => (await api.delete(`/categories/${id}/`)).data

// Tags
export const fetchAdminTags = async () => unwrapList(await api.get("/tags/"))
export const createAdminTag = async (payload) => (await api.post("/tags/", payload)).data
export const updateAdminTag = async (id, payload) => (await api.put(`/tags/${id}/`, payload)).data
export const deleteAdminTag = async (id) => (await api.delete(`/tags/${id}/`)).data

// Comments
export const fetchAdminComments = async () => (await api.get("/auth/admin/comments/")).data
export const approveAdminComment = async (id) => (await api.post(`/auth/admin/comments/${id}/approve/`)).data
export const deleteAdminComment = async (id) => (await api.delete(`/auth/admin/comments/${id}/`)).data

// Subscriptions & Payments
export const fetchAdminSubscriptions = async () => (await api.get("/auth/admin/subscriptions/")).data
export const fetchAdminPayments = async () => (await api.get("/auth/admin/payments/")).data

// Plans
export const fetchAdminPlans = async () => unwrapList(await api.get("/auth/admin/plans/"))
export const createAdminPlan = async (payload) => (await api.post("/auth/admin/plans/", payload)).data
export const updateAdminPlan = async (id, payload) => (await api.patch(`/auth/admin/plans/${id}/`, payload)).data
export const deleteAdminPlan = async (id) => (await api.delete(`/auth/admin/plans/${id}/`)).data

// Site Settings
export const fetchSiteSettings = async () => (await api.get("/auth/admin/settings/")).data
export const updateSiteSettings = async (payload) => (await api.put("/auth/admin/settings/", payload)).data
