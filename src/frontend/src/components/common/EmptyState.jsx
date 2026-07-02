const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    {Icon && (
      <div className="h-14 w-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
        <Icon size={26} className="text-brand-500" />
      </div>
    )}
    <h3 className="font-display font-semibold text-lg text-ink-900">{title}</h3>
    {message && <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
