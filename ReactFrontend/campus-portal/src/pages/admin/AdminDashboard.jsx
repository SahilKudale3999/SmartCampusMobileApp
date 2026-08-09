import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, GraduationCap, UserCog, BookOpen, Layers, CalendarDays, ArrowUpRight } from "lucide-react";
import StatCard from "../../components/admin/StatCard";
import toast from "react-hot-toast";

import { getAllUsers } from "../../api/userApi";
import { getAllFaculty } from "../../api/facultyApi";
import { getAllStudents } from "../../api/studentApi";
import { getAllCourses } from "../../api/courseApi";
import { getAllSubjects } from "../../api/subjectApi";
import { getAllEvents } from "../../api/eventApi";

const extractArray = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  return [];
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    faculty: 0,
    students: 0,
    courses: 0,
    subjects: 0,
    events: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [users, faculty, students, courses, subjects, events] =
        await Promise.all([
          getAllUsers(),
          getAllFaculty(),
          getAllStudents(),
          getAllCourses(),
          getAllSubjects(),
          getAllEvents(),
        ]);

      const usersArr = extractArray(users);
      const facultyArr = extractArray(faculty);
      const studentsArr = extractArray(students);
      const coursesArr = extractArray(courses);
      const subjectsArr = extractArray(subjects);
      const eventsArr = extractArray(events);

      setStats({
        users: usersArr.length,
        faculty: facultyArr.length,
        students: studentsArr.length,
        courses: coursesArr.length,
        subjects: subjectsArr.length,
        events: eventsArr.length,
      });

      const today = new Date();
      const upcoming = eventsArr
        .filter((e) => new Date(e.eventDate) >= today)
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
        .slice(0, 5);

      setUpcomingEvents(upcoming);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-900 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading SmartCampus dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Inline styles for the moving navy blue gradient background and the looping RGB border effect */}
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
        @keyframes rgbRainbowBorder {
          0% { border-color: #ef4444; box-shadow: 0 0 45px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.2); }
          16% { border-color: #f97316; box-shadow: 0 0 45px rgba(249, 115, 22, 0.6), inset 0 0 20px rgba(249, 115, 22, 0.2); }
          33% { border-color: #eab308; box-shadow: 0 0 45px rgba(234, 179, 8, 0.6), inset 0 0 20px rgba(234, 179, 8, 0.2); }
          50% { border-color: #22c55e; box-shadow: 0 0 45px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.2); }
          66% { border-color: #3b82f6; box-shadow: 0 0 45px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(59, 130, 246, 0.2); }
          83% { border-color: #a855f7; box-shadow: 0 0 45px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(168, 85, 247, 0.2); }
          100% { border-color: #ef4444; box-shadow: 0 0 45px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.2); }
        }
        .rgb-card-border {
          animation: rgbRainbowBorder 6s infinite linear;
        }
      `}</style>

      {/* Top Banner / Welcome Section with original moving navy gradient inside and looping RGB border */}
      <div className="relative overflow-hidden animated-navy-banner border-2 rounded-3xl p-8 text-white rgb-card-border shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/50 text-blue-200 text-xs font-semibold tracking-wide uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Admin Control Panel
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">SmartCampus Dashboard</h1>
            <p className="text-blue-200/80 text-sm mt-1 max-w-xl">
              Monitor campus analytics, manage academic entities, and stay updated with scheduled university events.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/events")}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/25 text-white text-sm font-medium px-4 py-2.5 rounded-xl border border-white/10 backdrop-blur-md transition-all shadow-md"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Manage Events</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">System Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard
            title="Total Users"
            value={stats.users}
            icon={UserCog}
            color="indigo"
            onClick={() => navigate("/admin/users")}
          />
          <StatCard
            title="Faculty"
            value={stats.faculty}
            icon={Users}
            color="blue"
            onClick={() => navigate("/admin/faculty")}
          />
          <StatCard
            title="Students"
            value={stats.students}
            icon={GraduationCap}
            color="green"
            onClick={() => navigate("/admin/students")}
          />
          <StatCard
            title="Courses"
            value={stats.courses}
            icon={BookOpen}
            color="purple"
            onClick={() => navigate("/admin/courses")}
          />
          <StatCard
            title="Subjects"
            value={stats.subjects}
            icon={Layers}
            color="orange"
            onClick={() => navigate("/admin/subjects")}
          />
          <StatCard
            title="Events"
            value={stats.events}
            icon={CalendarDays}
            color="pink"
            onClick={() => navigate("/admin/events")}
          />
        </div>
      </div>

      {/* Upcoming events section */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Campus Events</h2>
            <p className="text-xs text-slate-500 mt-0.5">Next scheduled events on campus</p>
          </div>
          <button
            onClick={() => navigate("/admin/events")}
            className="text-sm font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 group transition-colors"
          >
            <span>View all</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No upcoming events found.</p>
            <p className="text-xs text-slate-400 mt-1">Check back later or add new events from the events panel.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcomingEvents.map((event) => (
              <li
                key={event.eventId}
                onClick={() => navigate("/admin/events")}
                className="py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 rounded-2xl px-4 -mx-4 transition-all group"
              >
                <div className="space-y-1 pr-4">
                  <p className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {event.title}
                  </p>
                  <p className="text-sm text-slate-500 line-clamp-1">{event.description}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full shadow-sm">
                  {new Date(event.eventDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}