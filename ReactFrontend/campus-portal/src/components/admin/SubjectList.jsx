import { 
  Layers, 
  Code, 
  Terminal, 
  Cpu, 
  Database, 
  Globe, 
  Braces, 
  Smartphone, 
  BookOpen, 
  FileCode2, 
  Server, 
  Layout, 
  CpuIcon 
} from 'lucide-react';

// Helper to pick a specialized development/coding icon based on the subject name
const getSubjectIcon = (name = '') => {
  const lower = name.toLowerCase();

  // Android, iOS, and Mobile development
  if (lower.includes('android') || lower.includes('ios') || lower.includes('mobile') || lower.includes('flutter') || lower.includes('swift') || lower.includes('kotlin') || lower.includes('react native')) {
    return Smartphone;
  }
  // Web development, UI/UX, Frontend, HTML, CSS, JavaScript, React
  if (lower.includes('web') || lower.includes('html') || lower.includes('css') || lower.includes('react') || lower.includes('frontend') || lower.includes('ui') || lower.includes('ux') || lower.includes('javascript')) {
    return Globe;
  }
  // Databases, SQL, MongoDB, PostgreSQL, DBMS
  if (lower.includes('database') || lower.includes('sql') || lower.includes('mongo') || lower.includes('dbms') || lower.includes('postgres') || lower.includes('storage')) {
    return Database;
  }
  // Python, Data Science, AI, Machine Learning, Deep Learning
  if (lower.includes('python') || lower.includes('data') || lower.includes('ai') || lower.includes('ml') || lower.includes('machine learning') || lower.includes('analytics')) {
    return Terminal;
  }
  // Backend, APIs, Node, Java, C++, C#, DotNet, Systems
  if (lower.includes('java') || lower.includes('c++') || lower.includes('c#') || lower.includes('backend') || lower.includes('api') || lower.includes('node') || lower.includes('server')) {
    return Server;
  }
  // Architecture, Algorithms, Data Structures, Core CS, Software Engineering
  if (lower.includes('algorithm') || lower.includes('structure') || lower.includes('system') || lower.includes('architecture') || lower.includes('software') || lower.includes('engineering')) {
    return Cpu;
  }
  // Layout / Design components
  if (lower.includes('design') || lower.includes('layout') || lower.includes('pattern')) {
    return Layout;
  }

  // Default fallback coding icon
  return FileCode2;
};

export default function SubjectList({ subjects }) {
  if (subjects.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50/50 rounded-2xl">
        <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">No subjects found.</p>
        <p className="text-xs text-slate-400 mt-0.5">Add your first academic subject to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 bg-white">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-50/80 text-slate-600 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
            <th className="px-6 py-4">Subject Name</th>
            <th className="px-6 py-4">Associated Course</th>
            <th className="px-6 py-4">Assigned Faculty</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {subjects.map((s) => {
            const IconComponent = getSubjectIcon(s.subjectName);
            return (
              <tr key={s.subjectId} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-bold flex items-center justify-center shadow-md shadow-blue-950/15 shrink-0 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-5 h-5 text-white" strokeWidth={1.75} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">
                        {s.subjectName}
                      </span>
                      <div className="text-xs text-slate-400 mt-0.5">
                        ID: {s.subjectId}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                    <BookOpen className="w-3 h-3 text-blue-600" />
                    <span>{s.courseName || 'Unassigned'}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-xs font-medium text-slate-700 bg-slate-100/70 border border-slate-200 px-3 py-1 rounded-lg inline-block">
                    {s.facultyName || 'Not Assigned'}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}