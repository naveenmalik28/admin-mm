import { NavLink } from "react-router-dom"

const links = [
  { to: "/", label: "Overview", icon: "📊" },
  { to: "/users", label: "Users", icon: "👥" },
  { to: "/articles", label: "Articles", icon: "📝" },
  { to: "/comments", label: "Comments", icon: "💬" },
  { to: "/revenue", label: "Revenue", icon: "💳" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
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
            <span className="text-base">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
