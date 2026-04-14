import api from "./axios.js"

const unwrapList = (response) => response.data?.results ?? response.data

// Summary
export const fetchAdminSummary = async () => (await api.get("/auth/admin/summary/")).data

// Users
export const fetchAdminUsers = async () => unwrapList(await api.get("/auth/admin/users/"))

// Articles
export const fetchAdminArticles = async () => unwrapList(await api.get("/auth/admin/articles/"))
export const fetchAdminArticle = async (id) => (await api.get(`/auth/admin/articles/${id}/`)).data
export const createAdminArticle = async (payload) => (await api.post("/auth/admin/articles/create/", payload)).data
export const updateAdminArticle = async (id, payload) => (await api.patch(`/auth/admin/articles/${id}/`, payload)).data
export const deleteAdminArticle = async (id) => (await api.delete(`/auth/admin/articles/${id}/`)).data
export const uploadAdminImage = async (file) => {
  const formData = new FormData()
  formData.append("image", file)
  return (await api.post("/articles/upload-image/", formData, { headers: { "Content-Type": "multipart/form-data" } })).data
}

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

// Site Settings
export const fetchSiteSettings = async () => (await api.get("/auth/admin/settings/")).data
export const updateSiteSettings = async (payload) => (await api.put("/auth/admin/settings/", payload)).data
