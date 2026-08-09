import { useState } from 'react';
import toast from 'react-hot-toast';
import { activateUser, deactivateUser, deleteUser } from '../../api/userApi';
import { useAuth } from '../../auth/AuthContext';
import StatusToggle from '../common/StatusToggle';
import { Trash2, Loader2, ShieldCheck, Mail, Phone, User as UserIcon } from 'lucide-react';

const roleStyles = {
  ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm',
  FACULTY: 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm',
  STUDENT: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
};

export default function UserTable({ users, onChanged }) {
  const { user: currentUser } = useAuth();
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const handleToggle = async (u) => {
    setTogglingId(u.userId);
    try {
      if (u.isActive) {
        await deactivateUser(u.userId);
        toast.success(`${u.fullName} deactivated`);
      } else {
        await activateUser(u.userId);
        toast.success(`${u.fullName} activated`);
      }
      onChanged();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteUser(id);
      toast.success('User deleted');
      onChanged();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete user';
      toast.error(msg);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50/50 rounded-2xl">
        <UserIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">No users found.</p>
        <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search query or role filter.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-50/80 text-slate-600 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
            <th className="px-6 py-4">User Profile</th>
            <th className="px-6 py-4">Contact Info</th>
            <th className="px-6 py-4">Phone</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {users.map((u) => {
            const isSelf = currentUser?.userId === u.userId;
            return (
              <tr key={u.userId} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-950/15 shrink-0">
                      {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors flex items-center gap-2">
                        {u.fullName}
                        {isSelf && (
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>ID: {u.userId}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium">{u.email}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs">{u.phoneNo || '—'}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${roleStyles[u.role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    {u.role}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <StatusToggle
                    isActive={u.isActive}
                    onToggle={() => handleToggle(u)}
                    loading={togglingId === u.userId}
                  />
                </td>

                <td className="px-6 py-4 text-right">
                  {isSelf ? (
                    <span className="text-xs text-slate-300 font-medium">—</span>
                  ) : confirmId === u.userId ? (
                    <div className="flex items-center justify-end gap-2 bg-rose-50/60 p-2 rounded-xl border border-rose-100">
                      <span className="text-xs font-semibold text-rose-700">Delete user?</span>
                      <button
                        onClick={() => handleDelete(u.userId)}
                        disabled={deletingId === u.userId}
                        className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors shadow-sm disabled:opacity-60"
                      >
                        {deletingId === u.userId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Confirm'
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(u.userId)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl transition-all shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}