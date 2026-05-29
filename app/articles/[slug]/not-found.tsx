export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="flex items-center gap-5">
        <h1 className="text-[24px] font-medium text-white pr-6 border-r border-white/30">404</h1>
        <p className="text-[14px] text-white/70">This page could not be found.</p>
      </div>
    </div>
  );
}
