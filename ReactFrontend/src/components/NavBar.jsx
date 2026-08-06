import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GraduationCap, LogOut } from "lucide-react";
import { logout } from "../store/slices/authSlice";
import { visibleNavLinks } from "../config/roleAccess";

export default function NavBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const handleLogout = () => { dispatch(logout()); navigate("/login"); };
  const links = token ? visibleNavLinks(user?.role) : [];
  const name = user?.fullName ?? user?.email ?? "Logged in";

  return (
    <nav className="topbar">
      <Link className="brand" to={token ? "/" : "/login"}>
        <span className="brand-mark"><GraduationCap size={21} /></span><span>SmartCampus</span>
      </Link>
      {token && <div className="nav-links">{links.map(({ path, label }) => (
        <NavLink key={path} to={path} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>{label}</NavLink>
      ))}</div>}
      <span className="account-area">
        {token ? <>
          <span className="user-chip"><span className="avatar">{name.slice(0, 1).toUpperCase()}</span><span className="user-copy"><b>{name}</b>{user?.role && <small>{user.role}</small>}</span></span>
          <button className="icon-button" onClick={handleLogout} aria-label="Logout"><LogOut size={17} /></button>
        </> : <Link className="button button-sm" to="/login">Login</Link>}
      </span>
    </nav>
  );
}
