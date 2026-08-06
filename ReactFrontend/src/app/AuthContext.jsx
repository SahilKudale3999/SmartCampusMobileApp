import { createContext, useContext, useMemo, useState } from "react";
import { login as requestLogin } from "../features/auth/services/authService";
const AuthContext = createContext(null);
const KEY = "smart-campus-session";
export function AuthProvider({ children }) { const [session, setSession] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } }); const login = async (credentials) => { const data = await requestLogin(credentials); const next = { token: data.token, user: data.user }; localStorage.setItem(KEY, JSON.stringify(next)); setSession(next); return next; }; const logout = () => { localStorage.removeItem(KEY); setSession(null); }; const value = useMemo(() => ({ ...session, authenticated: Boolean(session?.token), login, logout }), [session]); return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; }
export const useAuth = () => useContext(AuthContext);
