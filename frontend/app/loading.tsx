import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={48} className="text-blue-500" />
        <p className="animate-pulse text-lg font-medium text-slate-200">Loading...</p>
      </div>
    </div>
  );
}
