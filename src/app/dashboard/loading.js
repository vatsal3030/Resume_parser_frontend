import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <Loader2 className="w-12 h-12 text-brutal-black animate-spin" />
      <h2 className="text-xl font-black uppercase tracking-widest text-gray-500 animate-pulse">Loading...</h2>
    </div>
  );
}
