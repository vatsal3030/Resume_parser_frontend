"use client";
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SkeletonBlock } from '@/components/ui/SkeletonState';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    if (id) {
      router.replace(`/dashboard/analyze?outputId=${id}`);
    } else {
      router.replace('/dashboard/analyze');
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-brutal-bg flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md w-full space-y-6 bg-white border-4 border-brutal-black p-8 shadow-[8px_8px_0_#000]">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-brutal-black border-t-transparent rounded-full" />
        <h1 className="text-2xl font-black uppercase tracking-tight">Redirecting...</h1>
        <p className="font-bold text-sm text-gray-500">
          This results page has been integrated. We are redirecting you to your unified Resume Analysis dashboard.
        </p>
      </div>
    </div>
  );
}
