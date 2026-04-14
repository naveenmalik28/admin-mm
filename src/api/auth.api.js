import api from "./axios.js"

export const loginAdmin = async (payload) => {
  const { data } = await api.post("/auth/login/", payload)
  return data
}

