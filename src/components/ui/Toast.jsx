import { useEffect } from "react"
import { createRoot } from "react-dom/client"

let toastRoot = null

export const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === "success" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
  const textColor = type === "success" ? "text-emerald-700" : "text-red-700"
  const icon = type === "success" ? "✓" : "⚠"

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-card animate-fade-in-up ${bgColor} ${textColor}`}>
      <span className="font-bold">{icon}</span>
      <p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 font-black opacity-50 hover:opacity-100 transition">✕</button>
    </div>
  )
}

export const showToast = (message, type = "success") => {
  if (!toastRoot) {
    const el = document.createElement("div")
    document.body.appendChild(el)
    toastRoot = createRoot(el)
  }
  toastRoot.render(<Toast message={message} type={type} onClose={() => toastRoot.render(null)} />)
}
