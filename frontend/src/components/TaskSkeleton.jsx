export default function TaskSkeleton() {
  return (
    <div className="glass p-4 rounded-lg animate-pulse">
      <div className="h-5 bg-white/6 w-3/4 mb-4 rounded"></div>
      <div className="h-3 bg-white/6 w-full mb-2 rounded"></div>
      <div className="h-3 bg-white/6 w-5/6 rounded"></div>
      <div className="flex justify-between mt-4">
        <div className="h-6 w-24 bg-white/6 rounded"></div>
        <div className="h-6 w-12 bg-white/6 rounded"></div>
      </div>
    </div>
  );
}
