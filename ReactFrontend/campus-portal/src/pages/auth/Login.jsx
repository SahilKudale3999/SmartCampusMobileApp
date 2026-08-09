import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { GraduationCap, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'ADMIN') {
        toast.error('This portal is for admins only.');
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, ${user.fullName}`);
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <style>{`
        @keyframes rgbRainbowBorder {
          0% { border-color: #ef4444; box-shadow: 0 0 45px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.2); }
          16% { border-color: #f97316; box-shadow: 0 0 45px rgba(249, 115, 22, 0.6), inset 0 0 20px rgba(249, 115, 22, 0.2); }
          33% { border-color: #eab308; box-shadow: 0 0 45px rgba(234, 179, 8, 0.6), inset 0 0 20px rgba(234, 179, 8, 0.2); }
          50% { border-color: #22c55e; box-shadow: 0 0 45px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.2); }
          66% { border-color: #3b82f6; box-shadow: 0 0 45px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(59, 130, 246, 0.2); }
          83% { border-color: #a855f7; box-shadow: 0 0 45px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(168, 85, 247, 0.2); }
          100% { border-color: #ef4444; box-shadow: 0 0 45px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.2); }
        }
        @keyframes rgbRainbowText {
          0% { color: #ef4444; text-shadow: 0 0 15px rgba(239, 68, 68, 0.5); }
          16% { color: #f97316; text-shadow: 0 0 15px rgba(249, 115, 22, 0.5); }
          33% { color: #eab308; text-shadow: 0 0 15px rgba(234, 179, 8, 0.5); }
          50% { color: #22c55e; text-shadow: 0 0 15px rgba(34, 197, 94, 0.5); }
          66% { color: #3b82f6; text-shadow: 0 0 15px rgba(59, 130, 246, 0.5); }
          83% { color: #a855f7; text-shadow: 0 0 15px rgba(168, 85, 247, 0.5); }
          100% { color: #ef4444; text-shadow: 0 0 15px rgba(239, 68, 68, 0.5); }
        }
        .rgb-card-border {
          animation: rgbRainbowBorder 6s infinite linear;
        }
        .rgb-text-glow {
          animation: rgbRainbowText 6s infinite linear;
        }
      `}</style>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 flex items-center justify-center mb-3 shadow-lg shadow-blue-950/20 border border-blue-800/50">
            <GraduationCap className="w-7 h-7 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SmartCampus</h1>
          <p className="text-sm font-medium mt-1 rgb-text-glow">Admin console</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/90 border-2 rounded-3xl p-8 shadow-2xl text-white rgb-card-border backdrop-blur-xl transition-all"
        >
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="admin@smartcampus.edu"
            />
          </div>

          <div className="mb-7">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-blue-950/50 disabled:opacity-60 active:scale-[0.98]"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}