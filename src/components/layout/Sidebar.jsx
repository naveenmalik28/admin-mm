import { NavLink } from "react-router-dom"

const links = [
  { to: "/", label: "Overview", icon: "OV" },
  { to: "/users", label: "Users", icon: "US" },
  { to: "/articles", label: "Articles", icon: "AR" },
  { to: "/comments", label: "Comments", icon: "CM" },
  { to: "/revenue", label: "Revenue", icon: "RV" },
  { to: "/plans", label: "Plans", icon: "PL" },
  { to: "/settings", label: "Settings", icon: "ST" },
]

export default function Sidebar() {
  return (
    <aside className="panel p-4">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-mint">Navigation</div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-slatex text-white" : "hover:bg-mint/10"}`
            }
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold tracking-wide">
              {link.icon}
            </span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
