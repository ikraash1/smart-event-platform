const colorMap = {
  brand: 'bg-brand-50 text-brand-600',
  accent: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-600',
};

const StatCard = ({ icon: Icon, label, value, color = 'brand', sublabel }) => (
  <div className="card p-5 flex items-start gap-4">
    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.brand}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-display font-bold text-2xl text-ink-900 mt-0.5">{value}</p>
      {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
  </div>
);

export default StatCard;
