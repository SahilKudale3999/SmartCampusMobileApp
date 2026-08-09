import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createUser } from '../../api/userApi';
import { createStudent } from '../../api/studentApi';
import { getAllCourses } from '../../api/courseApi';
import { Loader2, User, Mail, Lock, Phone, Hash, BookOpen, X } from 'lucide-react';

export default function AddStudentForm({ onSuccess }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNo: '',
    rollNo: '',
    courseId: '',
  });
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllCourses()
      .then((res) => setCourses(res.data.data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoadingCourses(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.courseId) {
      toast.error('Please select a course');
      return;
    }

    setLoading(true);
    try {
      const userRes = await createUser({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNo: form.phoneNo,
        role: 'STUDENT',
      });
      const newUserId = userRes.data.data.userId;

      await createStudent({
        userId: newUserId,
        courseId: Number(form.courseId),
        rollNo: form.rollNo,
      });

      toast.success('Student added successfully');
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add student';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'fullName', label: 'Full Name', icon: User, type: 'text', placeholder: 'Aditi Sharma', autoComplete: 'new-fullname' },
    { name: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'aditi.sharma@smartcampus.edu', autoComplete: 'new-email-field' },
    { name: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Temporary secure password', autoComplete: 'new-password' },
    { name: 'phoneNo', label: 'Phone Number', icon: Phone, type: 'text', placeholder: 'Optional contact number', autoComplete: 'off' },
    { name: 'rollNo', label: 'Roll Number', icon: Hash, type: 'text', placeholder: 'CS2026001', autoComplete: 'off' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md px-4 animate-in fade-in duration-200"
      onClick={onSuccess}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/85 w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Exit / Close Button */}
        <button
          onClick={onSuccess}
          className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6 pr-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-full mb-2">
            <span>Student Management</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Add New Student</h2>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
          {fields.map(({ name, label, icon: Icon, type, placeholder, autoComplete }) => (
            <div key={name}>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-900" />
                <input
                  name={name}
                  type={type}
                  required={name !== 'phoneNo'}
                  autoComplete={autoComplete}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all shadow-sm font-medium"
                  placeholder={placeholder}
                />
              </div>
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Course Program
            </label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-900 pointer-events-none" />
              {loadingCourses ? (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 py-3 pl-11 bg-slate-50/60 rounded-2xl border border-slate-200/80">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-900" />
                  Loading available courses...
                </div>
              ) : (
                <select
                  name="courseId"
                  required
                  value={form.courseId}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all shadow-sm font-medium"
                >
                  <option value="">Select a course program</option>
                  {courses.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.courseName}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {!loadingCourses && courses.length === 0 && (
              <p className="text-xs text-amber-600 font-medium mt-1.5 ml-1">No courses found — add a course first.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (!loadingCourses && courses.length === 0)}
            className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl py-3 text-sm font-bold transition-all shadow-lg shadow-blue-950/25 active:scale-[0.98] disabled:opacity-60 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding Student Profile...</span>
              </>
            ) : (
              <span>Add Student Profile</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}