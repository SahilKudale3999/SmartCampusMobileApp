import { useEffect, useState, useMemo } from "react";
import { FileText, Search, ClipboardCheck, GraduationCap, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";

import { getAllSubmissions, gradeSubmission } from "../../api/submissionApi";
import { getAllAssignments } from "../../api/assignmentApi";
import { getAllSubjects } from "../../api/subjectApi";
import { resolveFileUrl } from "../../utils/resolveFileUrl";

const extractArray = (res) => {
  const d = res && res.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.data)) return d.data;
  if (d && Array.isArray(d.content)) return d.content;
  return [];
};

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState(null);
  const [gradeInput, setGradeInput] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const results = await Promise.all([
        getAllSubmissions(),
        getAllAssignments(),
        getAllSubjects(),
      ]);
      setSubmissions(extractArray(results[0]));
      setAssignments(extractArray(results[1]));
      setSubjects(extractArray(results[2]));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const assignmentMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < assignments.length; i++) {
      map[assignments[i].assignmentId] = assignments[i];
    }
    return map;
  }, [assignments]);

  const subjectMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < subjects.length; i++) {
      map[subjects[i].subjectId] = subjects[i].subjectName;
    }
    return map;
  }, [subjects]);

  const enrichedSubmissions = useMemo(() => {
    return submissions.map((s) => {
      const assignment = assignmentMap[s.assignmentId];
      const subjectId = assignment ? assignment.subjectId : undefined;
      const assignmentTitle = assignment ? assignment.title : "Unknown";
      const subjectName = subjectMap[subjectId] ? subjectMap[subjectId] : "Unknown";
      return Object.assign({}, s, {
        assignmentTitle: assignmentTitle,
        subjectId: subjectId,
        subjectName: subjectName,
      });
    });
  }, [submissions, assignmentMap, subjectMap]);

  const filteredSubmissions = useMemo(() => {
    return enrichedSubmissions.filter((s) => {
      const matchesSubject =
        selectedSubject === "all" || String(s.subjectId) === String(selectedSubject);
      const term = searchTerm.toLowerCase();
      const studentName = s.studentName ? s.studentName.toLowerCase() : "";
      const assignmentTitle = s.assignmentTitle ? s.assignmentTitle.toLowerCase() : "";
      const matchesSearch = studentName.includes(term) || assignmentTitle.includes(term);
      return matchesSubject && matchesSearch;
    });
  }, [enrichedSubmissions, selectedSubject, searchTerm]);

  const handleGradeSave = async (submissionId) => {
    if (gradeInput.trim() === "") return;
    try {
      await gradeSubmission(submissionId, gradeInput.trim());
      toast.success("Grade saved successfully");
      setGradingId(null);
      setGradeInput("");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save grade");
    }
  };

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
              Evaluation &amp; Grading Hub
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Student Submissions</h1>
            <p className="text-blue-200/80 text-sm mt-1 max-w-xl">
              Review submitted assignments, audit file deliverables, and grade student submissions in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 flex items-center justify-center border border-blue-400/20">
                <ClipboardCheck className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <span className="block text-[11px] text-blue-200/70 font-medium">Matching Submissions</span>
                <span className="text-lg font-bold text-white">{filteredSubmissions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar / Filters Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student or assignment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all shadow-sm"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all shadow-sm"
          >
            <option value="all">All Subjects</option>
            {subjects.map((subj) => (
              <option key={subj.subjectId} value={subj.subjectId}>
                {subj.subjectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area / Table Section */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-900 border-t-transparent animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Loading student submissions...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Submissions Registry</h2>
              <p className="text-xs text-slate-500 mt-0.5">Showing student academic uploads and evaluations</p>
            </div>
            <div className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Live Registry
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl m-6 border border-slate-100">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No submissions found.</p>
              <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria or subject filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4">Student Profile</th>
                    <th className="px-6 py-4">Assignment Title</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Submitted On</th>
                    <th className="px-6 py-4">Grade Status</th>
                    <th className="px-6 py-4 text-right">File Deliverable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredSubmissions.map((s) => (
                    <tr key={s.submissionId} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-950/15 shrink-0">
                            {s.studentName ? s.studentName.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">
                              {s.studentName}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              ID: {s.submissionId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {s.assignmentTitle}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                          {s.subjectName}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {s.submittedAt
                              ? new Date(s.submittedAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {gradingId === s.submissionId ? (
                          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                            <input
                              type="text"
                              autoFocus
                              value={gradeInput}
                              onChange={(e) => setGradeInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleGradeSave(s.submissionId);
                                }
                                if (e.key === "Escape") {
                                  setGradingId(null);
                                  setGradeInput("");
                                }
                              }}
                              placeholder="Score"
                              className="w-16 px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                            />
                            <button
                              onClick={() => handleGradeSave(s.submissionId)}
                              className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors shadow-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setGradingId(null);
                                setGradeInput("");
                              }}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-1.5 py-1 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : s.grade ? (
                          <button
                            onClick={() => {
                              setGradingId(s.submissionId);
                              setGradeInput(String(s.grade));
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-sm transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Score: {s.grade}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setGradingId(s.submissionId);
                              setGradeInput("");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 shadow-sm transition-all"
                          >
                            Grade it
                          </button>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {s.fileUrl ? (
                          <a
                            href={resolveFileUrl(s.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100/60 px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>View File</span>
                            <ExternalLink className="w-3 h-3 text-blue-500" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">No file attached</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}