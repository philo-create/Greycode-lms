import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-slate-500">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}
