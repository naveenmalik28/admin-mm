export const LoadingSpinner = ({ label = "Loading", fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-8 animate-fade-in text-slatex/50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint/20 border-t-mint"></div>
      <p className="text-sm font-semibold uppercase tracking-widest">{label}…</p>
    </div>
  )

  if (fullPage) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">{content}</div>
  }

  return <div className="panel flex h-full min-h-[200px] items-center justify-center">{content}</div>
}

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-2xl bg-slatex/5 ${className}`}></div>
)
