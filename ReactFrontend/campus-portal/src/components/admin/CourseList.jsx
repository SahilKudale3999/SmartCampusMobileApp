import { 
  Code, 
  Terminal, 
  Cpu, 
  Database, 
  Globe, 
  Braces, 
  Smartphone, 
  AppWindow, 
  Layers, 
  Laptop, 
  FileCode2, 
  CpuIcon 
} from 'lucide-react';

// Helper to pick a specific development icon based on the course name
const getCodingIcon = (name = '') => {
  const lower = name.toLowerCase();

  // Android & Mobile development
  if (lower.includes('android') || lower.includes('ios') || lower.includes('mobile') || lower.includes('flutter') || lower.includes('react native') || lower.includes('swift') || lower.includes('kotlin')) {
    return Smartphone;
  }
  // Web development / Frontend / HTML / React
  if (lower.includes('web') || lower.includes('html') || lower.includes('react') || lower.includes('frontend') || lower.includes('fullstack') || lower.includes('ui')) {
    return Globe;
  }
  // Databases / SQL / MongoDB
  if (lower.includes('database') || lower.includes('sql') || lower.includes('mongo') || lower.includes('postgres') || lower.includes('db')) {
    return Database;
  }
  // Python / Data Science / AI / ML
  if (lower.includes('python') || lower.includes('data') || lower.includes('ai') || lower.includes('ml') || lower.includes('machine learning')) {
    return Terminal;
  }
  // Backend / Java / C++ / C# / APIs
  if (lower.includes('java') || lower.includes('c++') || lower.includes('c#') || lower.includes('backend') || lower.includes('api') || lower.includes('node')) {
    return Braces;
  }
  // System design / Architecture / Algorithms
  if (lower.includes('system') || lower.includes('algorithm') || lower.includes('cs') || lower.includes('software')) {
    return Cpu;
  }

  // Default fallback coding development icon
  return FileCode2;
};

export default function CourseList({ courses }) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50/50 rounded-2xl">
        <Code className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">No development courses available.</p>
        <p className="text-xs text-slate-400 mt-0.5">Add your first programming course to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {courses.map((c) => {
        const IconComponent = getCodingIcon(c.courseName);
        return (
          <div
            key={c.courseId}
            className="group flex items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-900 flex items-center justify-center shrink-0 shadow-md shadow-blue-950/15 group-hover:scale-105 transition-transform">
              <IconComponent className="w-6 h-6 text-white" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-900 transition-colors">
                {c.courseName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                  ID: {c.courseId}
                </span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                  Development
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}