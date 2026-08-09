import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getAllAssignments } from '../../api/assignmentApi';
import { getAllSubjects } from '../../api/subjectApi';
import AssignmentList from '../../components/admin/AssignmentList';
import SubmissionsPanel from '../../components/admin/SubmissionsPanel';
import { Loader2, FileText } from 'lucide-react';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assignmentsRes, subjectsRes] = await Promise.all([
        getAllAssignments(),
        getAllSubjects(),
      ]);

      const subjectFacultyMap = {};
      subjectsRes.data.data.forEach((s) => {
        subjectFacultyMap[s.subjectId] = s.facultyName;
      });

      const enriched = assignmentsRes.data.data.map((a) => ({
        ...a,
        facultyName: subjectFacultyMap[a.subjectId],
      }));

      setAssignments(enriched);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalAssignmentsCount = useMemo(() => assignments.length, [assignments]);

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
              Task Management
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Assignments</h1>
            <p className="text-blue-200/80 text-sm mt-1 max-w-xl">
              All assignments across subjects. Track deliverables, monitor deadlines, and view student submissions per assignment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 flex items-center justify-center border border-blue-400/20">
                <FileText className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <span className="block text-[11px] text-blue-200/70 font-medium">Total Assignments</span>
                <span className="text-lg font-bold text-white">{totalAssignmentsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
            <p className="text-sm font-medium text-slate-500">Loading assignments and student submissions...</p>
          </div>
        </div>
      ) : (
        <AssignmentList assignments={assignments} onViewSubmissions={setSelectedAssignment} />
      )}

      {selectedAssignment && (
        <SubmissionsPanel
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
}