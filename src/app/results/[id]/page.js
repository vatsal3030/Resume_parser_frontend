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
 router.replace(`/dashboard/analyze/${id}`);
 } else {
 router.replace('/dashboard/analyze');
 }
 }, [id, router]);

 return (
 <div className="min-h-screen bg-(--canvas) flex flex-col items-center justify-center p-8 text-center">
 <div className="max-w-md w-full space-y-6 bg-white border border-(--hairline) p-8 shadow-lg">
 <div className="animate-spin inline-block w-8 h-8 border border-(--hairline) border-t-transparent rounded-full" />
 <h1 className="text-2xl font-medium">Redirecting...</h1>
 <p className="font-bold text-sm text-gray-500">
 This results page has been integrated. We are redirecting you to your unified Resume Analysis dashboard.
 </p>
 </div>
 </div>
 );
}
