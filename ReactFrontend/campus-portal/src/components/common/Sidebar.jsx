import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserSquare2,
  BookOpen,
  Layers,
  ClipboardList,
  FileCheck2,
  CalendarCheck2,
  PartyPopper,
  LogOut,
  Menu,
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/faculty', label: 'Faculty', icon: UserSquare2 },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/subjects', label: 'Subjects', icon: Layers },
  { to: '/admin/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/admin/submissions', label: 'Submissions', icon: FileCheck2 },
  { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck2 },
  { to: '/admin/events', label: 'Events', icon: PartyPopper },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      className={`shrink-0 h-screen sticky top-0 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800/80 transition-all duration-300 select-none overflow-x-hidden ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <style>{`
        @keyframes rgbRainbowBorderLoop {
          0% { border-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
          16% { border-color: #f97316; box-shadow: 0 0 15px rgba(249, 115, 22, 0.3); }
          33% { border-color: #eab308; box-shadow: 0 0 15px rgba(234, 179, 8, 0.3); }
          50% { border-color: #22c55e; box-shadow: 0 0 15px rgba(34, 197, 94, 0.3); }
          66% { border-color: #3b82f6; box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
          83% { border-color: #a855f7; box-shadow: 0 0 15px rgba(168, 85, 247, 0.3); }
          100% { border-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
        }
        @keyframes rgbRainbowTextLoop {
          0% { color: #ef4444; }
          16% { color: #f97316; }
          33% { color: #eab308; }
          50% { color: #22c55e; }
          66% { color: #3b82f6; }
          83% { color: #a855f7; }
          100% { color: #ef4444; }
        }
        .rgb-sidebar-card {
          animation: rgbRainbowBorderLoop 6s infinite linear;
        }
        .rgb-sidebar-text {
          animation: rgbRainbowTextLoop 6s infinite linear;
        }
        /* Hide scrollbars across all browsers while keeping scroll functionality */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Brand Header */}
      <div className={`flex items-center h-20 px-5 border-b border-slate-800/80 ${collapsed ? 'justify-center px-0' : 'gap-3.5'}`}>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-950/50 border border-purple-500/30 transition-transform duration-300 hover:scale-105 hover:rotate-3">
          <GraduationCap className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-white font-black text-base tracking-tight truncate">
              SmartCampus
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase rgb-sidebar-text">
              Admin Portal
            </span>
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-[1.02] hover:border-purple-500/50 transition-all shadow-sm ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <Menu className="w-4 h-4 shrink-0 text-slate-400 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2} />
          {!collapsed && <span>Collapse menu</span>}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-4 py-2 space-y-1.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 hover:shadow-lg ${
                collapsed ? 'justify-center px-0' : ''
              } ${
                isActive
                  ? 'bg-gradient-to-r from-blue-900 to-purple-900 text-white shadow-md shadow-purple-950/40 border border-purple-800/50'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white hover:border hover:border-slate-700/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 hover:scale-125 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'}`} strokeWidth={2} />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="border-t border-slate-800/80 p-4 bg-slate-950/40">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3.5 py-2.5 mb-3 bg-slate-900/90 rounded-2xl rgb-sidebar-card transition-all hover:bg-slate-800/90 hover:scale-[1.01]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-purple-700 to-pink-700 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm shadow-purple-950/40 border border-purple-500/30 transition-transform duration-300 hover:scale-110">
              {initials || 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-100 truncate leading-tight">{user?.fullName || 'Administrator'}</p>
              <p className="text-[10px] font-semibold truncate mt-0.5 rgb-sidebar-text">{user?.email || 'admin@smartcampus.edu'}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Log out' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 hover:scale-[1.02] border border-transparent transition-all ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0 transition-transform duration-300 hover:-translate-x-1" strokeWidth={2} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}