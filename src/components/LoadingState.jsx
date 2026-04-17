export default function LoadingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-white">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/15 border-t-sky-400" />
      <p className="text-sm uppercase tracking-[0.28em] text-slate-300">Loading mock APIs</p>
    </div>
  );
}
