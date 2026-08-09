import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSubmissionsByAssignment } from '../../api/submissionApi';
import { X, Loader2, FileText, ExternalLink, GraduationCap, CheckCircle2, Clock } from 'lucide-react';

const resolveFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatDateTime = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function SubmissionsPanel({ assignment, onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assignment) return;
    setLoading(true);
    getSubmissionsByAssignment(assignment.assignmentId)
      .then((res) => setSubmissions(res.data.data))
      .catch(() => toast.error('Failed to load submissions'))
      .finally(() => setLoading(false));
  }, [assignment]);

  if (!assignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Section */}
        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-full mb-1">
              <span>{assignment.subjectName || 'Assignment Submissions'}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{assignment.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto min-h-0 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-blue-900" />
              <p className="text-xs font-medium text-slate-500">Fetching student submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-100">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No submissions yet.</p>
              <p className="text-xs text-slate-400 mt-0.5">Students have not uploaded any work for this task yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {submissions.map((s) => (
                <div
                  key={s.submissionId}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-start justify-between gap-4 shadow-sm hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-950/15 shrink-0">
                      {s.studentName ? s.studentName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                        {s.studentName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Submitted {formatDateTime(s.submittedAt)}</span>
                      </p>
                      
                      {s.fileUrl && (
                        <a
                          href={resolveFileUrl(s.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100/60 px-3 py-1 rounded-lg mt-2.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Submitted File</span>
                          <ExternalLink className="w-3 h-3 text-blue-500" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {s.gradeScore != null ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Score: {s.gradeScore}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 shadow-sm">
                        Pending Grade
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Total Submissions: <strong className="text-slate-900">{submissions.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
}