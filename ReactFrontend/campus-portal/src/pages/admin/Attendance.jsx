import { useEffect, useState, useMemo } from "react";
import { Search, CheckCircle2, XCircle, Calendar, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

import { getAllAttendance } from "../../api/attendanceApi";
import { getAllStudents } from "../../api/studentApi";
import { getAllSubjects } from "../../api/subjectApi";

const extractArray = (res) => {
  const d = res && res.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.data)) return d.data;
  if (d && Array.isArray(d.content)) return d.content;
  return [];
};

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const results = await Promise.all([
        getAllAttendance(),
        getAllStudents(),
        getAllSubjects(),
      ]);
      setAttendance(extractArray(results[0]));
      setStudents(extractArray(results[1]));
      setSubjects(extractArray(results[2]));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const studentMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < students.length; i++) {
      map[students[i].studentId] = students[i].fullName;
    }
    return map;
  }, [students]);

  const subjectMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < subjects.length; i++) {
      map[subjects[i].subjectId] = subjects[i].subjectName;
    }
    return map;
  }, [subjects]);

  const enriched = useMemo(() => {
    return attendance.map((a) => {
      return Object.assign({}, a, {
        studentName: studentMap[a.studentId] ? studentMap[a.studentId] : "Unknown",
        subjectName: subjectMap[a.subjectId] ? subjectMap[a.subjectId] : "Unknown",
      });
    });
  }, [attendance, studentMap, subjectMap]);

  const filtered = useMemo(() => {
    return enriched.filter((a) => {
      const matchesSubject =
        selectedSubject === "all" || String(a.subjectId) === String(selectedSubject);
      const term = searchTerm.toLowerCase();
      const matchesSearch = a.studentName.toLowerCase().includes(term);
      return matchesSubject && matchesSearch;
    });
  }, [enriched, selectedSubject, searchTerm]);

  const presentCount = useMemo(() => filtered.filter((a) => a.status === "PRESENT").length, [filtered]);
  const totalCount = filtered.length;
  const attendancePercent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

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
              Student Logs &amp; Presence
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Attendance Tracking</h1>
            <p className="text-blue-200/80 text-sm mt-1 max-w-xl">
              Monitor class participation, audit daily logs, and evaluate present rates across coding subjects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 flex items-center justify-center border border-blue-400/20">
                <UserCheck className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <span className="block text-[11px] text-blue-200/70 font-medium">Present Rate</span>
                <span className="text-lg font-bold text-white">{attendancePercent}%</span>
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
              placeholder="Search by student name..."
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
            <p className="text-sm font-medium text-slate-500">Loading attendance registry...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Attendance Records</h2>
              <p className="text-xs text-slate-500 mt-0.5">Showing {totalCount} total tracking entries</p>
            </div>
            <div className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Live Registry
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl m-6 border border-slate-100">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No attendance records found.</p>
              <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria or subject filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4">Student Profile</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filtered.map((a) => (
                    <tr key={a.attendanceId} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-950/15 shrink-0">
                            {a.studentName ? a.studentName.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">
                              {a.studentName}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              ID: {a.attendanceId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                          {a.subjectName}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {a.attendanceDate
                              ? new Date(a.attendanceDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {a.status === "PRESENT" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Absent
                          </span>
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