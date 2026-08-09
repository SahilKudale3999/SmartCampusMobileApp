import { useState } from 'react';
import toast from 'react-hot-toast';
import { deleteFaculty } from '../../api/facultyApi';
import { Trash2, Loader2, Mail, Building2, Users } from 'lucide-react';

export default function FacultyTable({ faculty, onChanged }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteFaculty(id);
      toast.success('Faculty deleted');
      onChanged();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete faculty';
      toast.error(msg);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (faculty.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50/50 rounded-2xl">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">No faculty members found.</p>
        <p className="text-xs text-slate-400 mt-0.5">Add your first faculty member to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-50/80 text-slate-600 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
            <th className="px-6 py-4">Faculty Member</th>
            <th className="px-6 py-4">Email Address</th>
            <th className="px-6 py-4">Department</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {faculty.map((f) => (
            <tr key={f.facultyId} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-950/15 shrink-0">
                    {f.fullName ? f.fullName.charAt(0).toUpperCase() : 'F'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {f.fullName}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      ID: {f.facultyId}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs font-medium">{f.email}</span>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  <span>{f.department || 'General'}</span>
                </div>
              </td>

              <td className="px-6 py-4 text-right">
                {confirmId === f.facultyId ? (
                  <div className="flex items-center justify-end gap-2 bg-rose-50/60 p-2 rounded-xl border border-rose-100">
                    <span className="text-xs font-semibold text-rose-700">Delete faculty?</span>
                    <button
                      onClick={() => handleDelete(f.facultyId)}
                      disabled={deletingId === f.facultyId}
                      className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors shadow-sm disabled:opacity-60"
                    >
                      {deletingId === f.facultyId ? (
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
                    onClick={() => setConfirmId(f.facultyId)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}