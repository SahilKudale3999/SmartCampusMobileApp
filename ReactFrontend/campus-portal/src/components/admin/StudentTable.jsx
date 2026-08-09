import { useState } from 'react';
import toast from 'react-hot-toast';
import { deleteUser } from '../../api/userApi';
import { Trash2, Loader2, Mail, BookOpen, GraduationCap, Hash } from 'lucide-react';

export default function StudentTable({ students, onChanged }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const handleDelete = async (studentId, userId) => {
    setDeletingId(studentId);
    try {
      await deleteUser(userId);
      toast.success('Student deleted');
      onChanged();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete student';
      toast.error(msg);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50/50 rounded-2xl">
        <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">No students found.</p>
        <p className="text-xs text-slate-400 mt-0.5">Add your first student to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-50/80 text-slate-600 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
            <th className="px-6 py-4">Roll No</th>
            <th className="px-6 py-4">Student Profile</th>
            <th className="px-6 py-4">Email Address</th>
            <th className="px-6 py-4">Course</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {students.map((s) => (
            <tr key={s.studentId} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-4 font-mono text-xs font-bold text-blue-900">
                <div className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                  <Hash className="w-3 h-3 text-blue-600" />
                  <span>{s.rollNo}</span>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-950/15 shrink-0">
                    {s.fullName ? s.fullName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {s.fullName}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      ID: {s.studentId}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs font-medium">{s.email}</span>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                  <BookOpen className="w-3 h-3 text-emerald-600" />
                  <span>{s.courseName || 'Unassigned'}</span>
                </div>
              </td>

              <td className="px-6 py-4 text-right">
                {confirmId === s.studentId ? (
                  <div className="flex items-center justify-end gap-2 bg-rose-50/60 p-2 rounded-xl border border-rose-100">
                    <span className="text-xs font-semibold text-rose-700">Delete student?</span>
                    <button
                      onClick={() => handleDelete(s.studentId, s.userId)}
                      disabled={deletingId === s.studentId}
                      className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors shadow-sm disabled:opacity-60"
                    >
                      {deletingId === s.studentId ? (
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
                    onClick={() => setConfirmId(s.studentId)}
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