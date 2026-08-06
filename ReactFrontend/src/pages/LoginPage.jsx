import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { login } from "../store/slices/authSlice";

export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const dispatch = useDispatch(); const navigate = useNavigate(); const { status, error, token } = useSelector((state) => state.auth);
  if (token) return <Navigate to="/" replace />;
  const handleSubmit = async (e) => { e.preventDefault(); const result = await dispatch(login({ email, password })); if (login.fulfilled.match(result)) navigate("/"); };
  return <div className="auth-page"><section className="auth-card">
    <div className="brand"><span className="brand-mark"><GraduationCap size={21} /></span><span>SmartCampus</span></div>
    <p className="eyebrow">Welcome back</p><h2>Sign in to your account</h2><p className="page-subtitle">Use your campus credentials to continue.</p>
    <form className="auth-form" onSubmit={handleSubmit}><div className="field"><label>Email address</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></div><div className="field"><label>Password</label><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></div><button className="button" type="submit" disabled={status === "loading"}>{status === "loading" ? "Logging in..." : "Sign in"}</button></form>
    {error && <p className="form-error">{error.message ?? String(error)}</p>}<p className="auth-footer">No account? <Link to="/register">Create one</Link></p>
  </section></div>;
}
