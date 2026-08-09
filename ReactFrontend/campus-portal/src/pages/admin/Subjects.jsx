import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getAllSubjects } from '../../api/subjectApi';
import SubjectList from '../../components/admin/SubjectList';
import { Loader2, Search, Layers } from 'lucide-react';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllSubjects();
      setSubjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return subjects.filter(
      (s) =>
        s.subjectName.toLowerCase().includes(q) ||
        s.courseName?.toLowerCase().includes(q) ||
        s.facultyName?.toLowerCase().includes(q)
    );
  }, [subjects, search]);

  const totalSubjectsCount = useMemo(() => subjects.length, [subjects]);

  return (
    <div className="space-y-6 pb-12">
      {/* Inline styles for the smooth continuous moving gradient animation */}
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
      `}</style>

      {/* Immersive Top Banner Section */}
      <div className="relative overflow-hidden animated-navy-banner rounded-3xl p-8 shadow-2xl shadow-blue-950/25 text-white">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/50 text-blue-200 text-xs font-semibold tracking-wide uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Curriculum Modules
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Academic Subjects</h1>
            <p className="text-blue-200/80 text-sm mt-1 max-w-xl">
              Inspect all technical modules, programming subjects, course mappings, and assigned faculty members.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 flex items-center justify-center border border-blue-400/20">
                <Layers className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <span className="block text-[11px] text-blue-200/70 font-medium">Total Subjects</span>
                <span className="text-lg font-bold text-white">{totalSubjectsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar / Search Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject name, course, or assigned faculty..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
            <p className="text-sm font-medium text-slate-500">Loading academic subjects...</p>
          </div>
        </div>
      ) : (
        <SubjectList subjects={filtered} />
      )}
    </div>
  );
}