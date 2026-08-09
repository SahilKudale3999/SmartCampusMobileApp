import { useState } from 'react';
import toast from 'react-hot-toast';
import { createEvent } from '../../api/eventApi';
import { useAuth } from '../../auth/AuthContext';
import { Loader2, PartyPopper, MapPin, Calendar, FileText, X } from 'lucide-react';

const todayStr = () => new Date().toISOString().split('T')[0];

export default function AddEventForm({ onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    eventName: '',
    description: '',
    venue: '',
    eventDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEvent({
        eventName: form.eventName,
        description: form.description,
        venue: form.venue,
        eventDate: form.eventDate,
        createdBy: user.userId,
      });
      toast.success('Event added successfully');
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add event';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
            <span>Campus Activities</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Campus Event</h2>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Event Name
            </label>
            <div className="relative">
              <PartyPopper className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-900" />
              <input
                name="eventName"
                required
                autoComplete="off"
                value={form.eventName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all shadow-sm font-medium"
                placeholder="e.g. Full Stack Hackathon 2026"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-3.5 w-4 h-4 text-blue-900" />
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all shadow-sm resize-none font-medium"
                placeholder="Provide details about the hackathon, workshop, or technical seminar..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Venue / Platform
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-900" />
              <input
                name="venue"
                autoComplete="off"
                value={form.venue}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all shadow-sm font-medium"
                placeholder="e.g. Main Auditorium / Lab 3"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Event Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-900" />
              <input
                name="eventDate"
                type="date"
                required
                min={todayStr()}
                value={form.eventDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all shadow-sm font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 ml-1">Must be scheduled for today or a future date.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl py-3 text-sm font-bold transition-all shadow-lg shadow-blue-950/25 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Event...</span>
              </>
            ) : (
              <span>Publish Event</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}