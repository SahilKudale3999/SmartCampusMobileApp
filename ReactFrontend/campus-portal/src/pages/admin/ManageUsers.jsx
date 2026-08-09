import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getAllUsers } from '../../api/userApi';
import UserTable from '../../components/admin/UserTable';
import { Loader2, Search, Shield, GraduationCap, Users as UsersIcon } from 'lucide-react';

const roleFilters = ['ALL', 'ADMIN', 'FACULTY', 'STUDENT'];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'ADMIN').length;
    const faculty = users.filter((u) => u.role === 'FACULTY').length;
    const students = users.filter((u) => u.role === 'STUDENT').length;
    return { total, admins, faculty, students };
  }, [users]);

  return (
    <div className="space-y-6 pb-12">
      {/* Inline styles for the moving navy blue gradient background */}
      <style>{`
        @keyframes moveGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-navy-banner {
          background: linear-gradient(270deg, #020617, #1e3a8a, #0f172a, #1e40af);
          background-size: 400% 400%;
          animation: moveGradient 12s ease infinite;
        }
        
        /* Custom styled wrapper overrides for child UserTable to match the new look seamlessly */
        .custom-user-table table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .custom-user-table th {
          background: #f8fafc;
          color: #334155;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .custom-user-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        .custom-user-table tr:hover td {
          background-color: #f8fafc;
        }
      `}</style>

      {/* Immersive Header Section */}
      <div className="relative overflow-hidden animated-navy-banner rounded-3xl p-8 shadow-2xl shadow-blue-950/25 text-white">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-15 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/50 text-blue-200 text-xs font-semibold tracking-wide uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Directory &amp; Access Control
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Manage System Users</h1>
            <p className="text-blue-200/80 text-sm mt-1 max-w-xl">
              Inspect platform accounts, audit security permissions, filter profiles, and manage system access status.
            </p>
          </div>

          {/* Quick Metrics Badge Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-3 backdrop-blur-md text-center">
              <span className="block text-xs text-blue-200/70 font-medium">Total</span>
              <span className="text-xl font-bold text-white">{stats.total}</span>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl p-3 backdrop-blur-md text-center">
              <span className="block text-xs text-blue-200/70 font-medium">Admins</span>
              <span className="text-xl font-bold text-white">{stats.admins}</span>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl p-3 backdrop-blur-md text-center">
              <span className="block text-xs text-blue-200/70 font-medium">Faculty</span>
              <span className="text-xl font-bold text-white">{stats.faculty}</span>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl p-3 backdrop-blur-md text-center">
              <span className="block text-xs text-blue-200/70 font-medium">Students</span>
              <span className="text-xl font-bold text-white">{stats.students}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar / Filters Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by full name or email address..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all shadow-sm"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
            {roleFilters.map((r) => {
              const isActive = roleFilter === r;
              return (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-950 to-blue-900 text-white shadow-md shadow-blue-950/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {r === 'ADMIN' && <Shield className="w-3.5 h-3.5" />}
                  {r === 'FACULTY' && <UsersIcon className="w-3.5 h-3.5" />}
                  {r === 'STUDENT' && <GraduationCap className="w-3.5 h-3.5" />}
                  <span>{r === 'ALL' ? 'All Accounts' : r.charAt(0) + r.slice(1).toLowerCase()}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Modernized Data Section & Table List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
            <p className="text-sm font-medium text-slate-500">Synchronizing database users...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Accounts List</h2>
              <p className="text-xs text-slate-500 mt-0.5">Showing {filteredUsers.length} matching user records</p>
            </div>
            <div className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Live Database View
            </div>
          </div>
          
          <div className="overflow-x-auto custom-user-table">
            <UserTable users={filteredUsers} onChanged={fetchUsers} />
          </div>
        </div>
      )}
    </div>
  );
}