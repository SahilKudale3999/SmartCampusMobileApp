import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CalendarDays, ChevronLeft, GraduationCap, LayoutDashboard, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { resources } from "../features/resources/resourceDefinitions";
import { useAuth } from "../app/AuthContext";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const nav = resources.filter((r) => r.roles.includes(user?.role));

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark", !dark);
    setDark(!dark);
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 900) {
      setMobileOpen((value) => !value);
    } else {
      setCollapsed((value) => !value);
    }
  };

  const handleNavClick = () => setMobileOpen(false);

  return (
    <div className={`admin-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className={`sidebar-backdrop ${mobileOpen ? "visible" : ""}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><GraduationCap size={20} /></span>
          <b>SmartCampus</b>
          <button className="collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label="Collapse sidebar">
            {collapsed ? <Menu size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>
        <nav>
          <NavLink end to="/" className="side-link" onClick={handleNavClick}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>
          {nav.map((item) => (
            <NavLink key={item.key} to={`/${item.path}`} className="side-link" onClick={handleNavClick}>
              <CalendarDays size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="role-label">{user?.role}</span>
          <button
            className="side-link logout"
            onClick={() => {
              setMobileOpen(false);
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={toggleSidebar} aria-label="Toggle navigation">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="breadcrumb">Campus administration <span>/</span> Workspace</div>
          <div className="top-actions">
            <button className="icon-button" onClick={toggleDark} aria-label="Toggle theme">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <span className="user-chip">
              <span className="avatar">{user?.fullName?.[0]?.toUpperCase() ?? "U"}</span>
              <span className="user-copy">
                <b>{user?.fullName}</b>
                <small>{user?.role?.toLowerCase()}</small>
              </span>
            </span>
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
