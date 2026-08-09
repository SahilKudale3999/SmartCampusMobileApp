import { 
  PartyPopper, 
  MapPin, 
  Calendar, 
  User, 
  Code, 
  Terminal, 
  Trophy, 
  Laptop, 
  BookOpen, 
  Users, 
  Sparkles, 
  CalendarDays 
} from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Helper to pick a specialized event icon based on the event name or description
const getEventIcon = (name = '', desc = '') => {
  const combined = `${name} ${desc}`.toLowerCase();

  // Hackathons & Coding competitions
  if (combined.includes('hackathon') || combined.includes('coding') || combined.includes('code') || combined.includes('programming')) {
    return Code;
  }
  // Workshops & Training
  if (combined.includes('workshop') || combined.includes('training') || combined.includes('lab') || combined.includes('hands-on')) {
    return Laptop;
  }
  // Contests, Competitions & Prizes
  if (combined.includes('contest') || combined.includes('competition') || combined.includes('prize') || combined.includes('challenge') || combined.includes('win')) {
    return Trophy;
  }
  // Seminars, Lectures & Classes
  if (combined.includes('seminar') || combined.includes('lecture') || combined.includes('webinar') || combined.includes('session')) {
    return BookOpen;
  }
  // Meetups, Networking & Conferences
  if (combined.includes('meetup') || combined.includes('networking') || combined.includes('conference') || combined.includes('meet')) {
    return Users;
  }
  // Tech Talks, AI, ML, Terminals
  if (combined.includes('ai') || combined.includes('ml') || combined.includes('python') || combined.includes('tech talk') || combined.includes('terminal')) {
    return Terminal;
  }

  return PartyPopper;
};

export default function EventList({ events, onSelect }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-100">
        <PartyPopper className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">No events yet.</p>
        <p className="text-xs text-slate-400 mt-0.5">Add your first campus event to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((e) => {
        const IconComponent = getEventIcon(e.eventName, e.description);
        return (
          <button
            key={e.eventId}
            onClick={() => onSelect(e)}
            className="group text-left bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-bold flex items-center justify-center shrink-0 shadow-md shadow-blue-950/15 group-hover:scale-105 transition-transform">
                <IconComponent className="w-6 h-6 text-white" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-900 transition-colors">
                  {e.eventName}
                </p>
                {e.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {e.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 w-full text-xs">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                <span>{formatDate(e.eventDate)}</span>
              </div>
              {e.venue && (
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                  <span className="truncate">{e.venue}</span>
                </div>
              )}
              {(e.createdByName || e.createdBy) && (
                <div className="flex items-center gap-2 text-slate-400 font-normal">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{e.createdByName || `User #${e.createdBy}`}</span>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}