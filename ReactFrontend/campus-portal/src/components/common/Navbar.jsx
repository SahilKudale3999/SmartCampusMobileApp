import { useAuth } from '../../auth/AuthContext';
import { Menu } from 'lucide-react';

export default function Navbar({ collapsed, setCollapsed }) {
  const { user } = useAuth();

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
      <button
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm active:scale-95"
      >
        <Menu className="w-5 h-5" strokeWidth={2} />
      </button>

      <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-200/60 px-3.5 py-1.5 rounded-2xl shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-blue-900 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm shadow-blue-950/20">
          {initials || 'AD'}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-slate-900 leading-tight">{user?.fullName || 'Administrator'}</span>
          <span className="text-[10px] font-semibold text-slate-400 capitalize">{user?.role?.toLowerCase() || 'User'}</span>
        </div>
      </div>
    </header>
  );
}