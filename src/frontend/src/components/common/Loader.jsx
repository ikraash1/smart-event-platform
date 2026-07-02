const Loader = ({ label = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="h-9 w-9 rounded-full border-[3px] border-brand-100 border-t-brand-600 animate-spin" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>;
  }
  return content;
};

export default Loader;
