import { PartyPopper, MapPin, Calendar, User, FileText, X } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function EventDetailModal({ event, onClose }) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-8 pt-6 pb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-900 flex items-center justify-center shadow-md shadow-blue-950/20 shrink-0">
            <PartyPopper className="w-6 h-6 text-white" strokeWidth={1.75} />
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-8 pt-4 pb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-full mb-2">
            <span>Campus Event Details</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{event.eventName}</h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-2xl">
              <Calendar className="w-5 h-5 text-blue-900 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                <p className="text-sm text-slate-900 font-semibold mt-0.5">{formatDate(event.eventDate)}</p>
              </div>
            </div>

            {event.venue && (
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-2xl">
                <MapPin className="w-5 h-5 text-blue-900 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Venue</p>
                  <p className="text-sm text-slate-900 font-semibold mt-0.5">{event.venue}</p>
                </div>
              </div>
            )}

            {(event.createdByName || event.createdBy) && (
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-2xl">
                <User className="w-5 h-5 text-blue-900 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created By</p>
                  <p className="text-sm text-slate-900 font-semibold mt-0.5">
                    {event.createdByName || `User #${event.createdBy}`}
                  </p>
                </div>
              </div>
            )}

            {event.description && (
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-2xl">
                <FileText className="w-5 h-5 text-blue-900 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed mt-0.5">{event.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-950/20 active:scale-[0.98]"
            >
              Close Details
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}