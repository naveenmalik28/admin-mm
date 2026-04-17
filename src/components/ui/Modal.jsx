export default function Modal({ isOpen, onClose, title, message, onConfirm, confirmText = "Confirm", confirmStyle = "danger" }) {
  if (!isOpen) return null

  const bgBtn = confirmStyle === "danger" 
    ? "bg-red-50 text-red-600 hover:bg-red-100" 
    : "bg-mint text-white shadow hover:bg-mint/90"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slatex/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-xl animate-fade-in-up">
        {title && <h3 className="text-xl font-semibold mb-2 text-slatex">{title}</h3>}
        {message && <p className="text-sm text-slatex/60 mb-6">{message}</p>}
        <div className="flex items-center justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-slatex/60 hover:bg-slatex/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${bgBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
