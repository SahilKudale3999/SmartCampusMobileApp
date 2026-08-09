import { ClipboardList, FileCheck2, Calendar, Code, Terminal, Cpu, Database, Globe, Braces, Smartphone, FileCode2 } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Helper to pick a development icon based on assignment title or subject name
const getAssignmentIcon = (title = '') => {
  const lower = title.toLowerCase();

  if (lower.includes('android') || lower.includes('ios') || lower.includes('mobile') || lower.includes('flutter') || lower.includes('app')) {
    return Smartphone;
  }
  if (lower.includes('web') || lower.includes('html') || lower.includes('react') || lower.includes('frontend') || lower.includes('fullstack') || lower.includes('ui')) {
    return Globe;
  }
  if (lower.includes('database') || lower.includes('sql') || lower.includes('mongo') || lower.includes('query')) {
    return Database;
  }
  if (lower.includes('python') || lower.includes('data') || lower.includes('ai') || lower.includes('ml') || lower.includes('script')) {
    return Terminal;
  }
  if (lower.includes('java') || lower.includes('c++') || lower.includes('c#') || lower.includes('backend') || lower.includes('api')) {
    return Braces;
  }
  if (lower.includes('system') || lower.includes('algorithm') || lower.includes('architecture')) {
    return Cpu;
  }

  return FileCode2;
};

export default function AssignmentList({ assignments, onViewSubmissions }) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-200/80">
        <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">No assignments found.</p>
        <p className="text-xs text-slate-400 mt-0.5">Check back later for newly published tasks.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 bg-white">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-50/80 text-slate-600 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
            <th className="px-6 py-4">Assignment Title</th>
            <th className="px-6 py-4">Subject</th>
            <th className="px-6 py-4">Faculty</th>
            <th className="px-6 py-4">Deadline</th>
            <th className="px-6 py-4 text-right">Submissions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {assignments.map((a) => {
            const IconComponent = getAssignmentIcon(a.title);
            return (
              <tr key={a.assignmentId} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-bold flex items-center justify-center shadow-md shadow-blue-950/15 shrink-0 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-5 h-5 text-white" strokeWidth={1.75} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">
                        {a.title}
                      </span>
                      <div className="text-xs text-slate-400 mt-0.5">
                        ID: {a.assignmentId}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                    {a.subjectName || 'General'}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-xs font-medium text-slate-700 bg-slate-100/70 border border-slate-200 px-3 py-1 rounded-lg inline-block">
                    {a.facultyName || '—'}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full shadow-sm">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{formatDate(a.deadline)}</span>
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewSubmissions(a)}
                    className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-950/20 active:scale-[0.98]"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>View Submissions</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}