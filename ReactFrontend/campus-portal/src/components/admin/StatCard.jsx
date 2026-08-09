export default function StatCard({ title, value, icon: Icon, color = "blue", onClick }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    pink: "bg-pink-50 text-pink-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        <Icon size={22} />
      </div>
    </div>
  );
}