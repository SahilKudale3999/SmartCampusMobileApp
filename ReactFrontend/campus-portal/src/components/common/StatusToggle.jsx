export default function StatusToggle({ isActive, onToggle, loading }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      role="switch"
      aria-checked={isActive}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        isActive ? 'bg-emerald-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          isActive ? 'translate-x-4.5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
