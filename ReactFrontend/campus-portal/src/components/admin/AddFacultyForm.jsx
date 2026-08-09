import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createUser } from '../../api/userApi';
import { createFaculty } from '../../api/facultyApi';
import { createSubject } from '../../api/subjectApi';
import { getAllCourses } from '../../api/courseApi';
import { Loader2, User, Mail, Lock, Phone, Building2, Plus, Trash2, BookOpen, X } from 'lucide-react';

export default function AddFacultyForm({ onSuccess }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNo: '',
    department: '',
  });
  const [courses, setCourses] = useState([]);
  const [subjectRows, setSubjectRows] = useState([{ subjectName: '', courseId: '' }]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    getAllCourses()
      .then((res) => setCourses(res.data.data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoadingCourses(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubjectRowChange = (index, field, value) => {
    const updated = [...subjectRows];
    updated[index][field] = value;
    setSubjectRows(updated);
  };

  const addSubjectRow = () => {
    setSubjectRows([...subjectRows, { subjectName: '', courseId: '' }]);
  };

  const removeSubjectRow = (index) => {
    setSubjectRows(subjectRows.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRes = await createUser({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNo: form.phoneNo,
        role: 'FACULTY',
      });
      const newUserId = userRes.data.data.userId;

      const facultyRes = await createFaculty({
        userId: newUserId,
        department: form.department,
      });
      const newFacultyId = facultyRes.data.data.facultyId;

      const validRows = subjectRows.filter((r) => r.subjectName.trim() && r.courseId);

      for (const row of validRows) {
        await createSubject({
          subjectName: row.subjectName.trim(),
          courseId: Number(row.courseId),
          facultyId: newFacultyId,
        });
      }

      toast.success(
        validRows.length > 0
          ? `Faculty added with ${validRows.length} subject(s)`
          : 'Faculty added successfully'
      );
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add faculty';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'fullName', label: 'Full Name', icon: User, type: 'text', placeholder: 'Dr. Meera Nair', autoComplete: 'new-fullname' },
    { name: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'meera.nair@smartcampus.edu', autoComplete: 'new-email-field' },
    { name: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Temporary secure password', autoComplete: 'new-password' },
    { name: 'phoneNo', label: 'Phone Number', icon: Phone, type: 'text', placeholder: 'Optional contact number', autoComplete: 'off' },
    { name: 'department', label: 'Department', icon: Building2, type: 'text', placeholder: 'e.g. Computer Science & Engineering', autoComplete: 'off' },
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
            <span>Staff Management</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Add New Faculty</h2>
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

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assign Subjects (Optional)
              </label>
              <button
                type="button"
                onClick={addSubjectRow}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            {loadingCourses ? (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-900" />
                Loading available courses...
              </div>
            ) : courses.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No courses found — add a course first to assign subjects.</p>
            ) : (
              <div className="space-y-3">
                {subjectRows.map((row, index) => (
                  <div key={index} className="flex items-center gap-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
                    <div className="relative flex-1">
                      <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-900" />
                      <input
                        type="text"
                        autoComplete="off"
                        value={row.subjectName}
                        onChange={(e) => handleSubjectRowChange(index, 'subjectName', e.target.value)}
                        placeholder="Subject Name"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all shadow-sm"
                      />
                    </div>
                    <select
                      value={row.courseId}
                      onChange={(e) => handleSubjectRowChange(index, 'courseId', e.target.value)}
                      className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all shadow-sm"
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c.courseId} value={c.courseId}>
                          {c.courseName}
                        </option>
                      ))}
                    </select>
                    {subjectRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubjectRow(index)}
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 transition-colors bg-white shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-2 ml-1">Subject names must be unique across the system.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl py-3 text-sm font-bold transition-all shadow-lg shadow-blue-950/25 active:scale-[0.98] disabled:opacity-60 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding Faculty Member...</span>
              </>
            ) : (
              <span>Add Faculty Member</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}