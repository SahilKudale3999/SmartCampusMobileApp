import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getAllEvents } from '../../api/eventApi';
import EventList from '../../components/admin/EventList';
import AddEventForm from '../../components/admin/AddEventForm';
import EventDetailModal from '../../components/admin/EventDetailModal';
import Modal from '../../components/common/Modal';
import { Plus, Loader2, CalendarDays } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllEvents();
      setEvents(res.data.data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAdded = () => {
    setModalOpen(false);
    fetchEvents();
  };

  const totalEventsCount = useMemo(() => events.length, [events]);

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
              Campus Life &amp; Activities
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Events &amp; Announcements</h1>
            <p className="text-blue-200/80 text-sm mt-1 max-w-xl">
              Organize campus workshops, coding hackathons, technical seminars, and official institution announcements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 flex items-center justify-center border border-blue-400/20">
                <CalendarDays className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <span className="block text-[11px] text-blue-200/70 font-medium">Total Events</span>
                <span className="text-lg font-bold text-white">{totalEventsCount}</span>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white text-blue-950 text-sm font-bold px-5 py-3 rounded-2xl hover:bg-blue-50 transition-all shadow-lg shadow-blue-950/30 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
            <p className="text-sm font-medium text-slate-500">Loading campus events...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Event Schedule</h2>
              <p className="text-xs text-slate-500 mt-0.5">Active campus activities and programs</p>
            </div>
            <div className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Live Registry
            </div>
          </div>

          <div className="p-6">
            <EventList events={events} onSelect={setSelectedEvent} />
          </div>
        </div>
      )}

      {/* Modal Container */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Campus Event">
        <AddEventForm onSuccess={handleAdded} />
      </Modal>

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}