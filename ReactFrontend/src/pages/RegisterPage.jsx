import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { register } from "../store/slices/authSlice";

export default function RegisterPage() {
  const [fullName, setFullName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [phoneNo, setPhoneNo] = useState(""); const [role, setRole] = useState("STUDENT");
  const dispatch = useDispatch(); const navigate = useNavigate(); const { status, error, token } = useSelector((state) => state.auth);
  if (token) return <Navigate to="/" replace />;
  const handleSubmit = async (e) => { e.preventDefault(); const result = await dispatch(register({ fullName, email, password, phoneNo, role })); if (register.fulfilled.match(result)) navigate("/"); };
  return <div className="auth-page"><section className="auth-card"><div className="brand"><span className="brand-mark"><GraduationCap size={21} /></span><span>SmartCampus</span></div><p className="eyebrow">Join the campus</p><h2>Create your account</h2><p className="page-subtitle">Complete the details below to get started.</p>
    <form className="auth-form" onSubmit={handleSubmit}><div className="field"><label>Full name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div><div className="field"><label>Email address</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></div><div className="field"><label>Password</label><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></div><div className="field"><label>Phone number</label><input value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} /></div><div className="field"><label>Role</label><select value={role} onChange={(e) => setRole(e.target.value)}><option value="ADMIN">ADMIN</option><option value="FACULTY">FACULTY</option><option value="STUDENT">STUDENT</option></select></div><button className="button" type="submit" disabled={status === "loading"}>{status === "loading" ? "Registering..." : "Create account"}</button></form>
    {error && <div className="form-error"><p>{error.message ?? String(error)}</p>{error.fieldErrors && <ul>{Object.entries(error.fieldErrors).map(([field, msg]) => <li key={field}><strong>{field}</strong>: {msg}</li>)}</ul>}</div>}<p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
  </section></div>;
}
