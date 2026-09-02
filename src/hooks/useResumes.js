import useSWR from 'swr';
import api from '@/lib/api';

const fetcher = url => api.get(url).then(res => res.data);

export function useResumes() {
 const { data, error, isLoading, mutate } = useSWR('/resumes', fetcher, {
 revalidateOnFocus: false,
 revalidateIfStale: false, // Serve from cache if available, revalidate in background
 dedupingInterval: 60000 // Only re-fetch once per minute
 });

 return {
 resumes: data || [],
 isLoading,
 isError: error,
 mutate
 };
}

export function useStudioResumes() {
 const { data, error, isLoading, mutate } = useSWR('/studio/resumes', fetcher, {
 revalidateOnFocus: false,
 revalidateIfStale: false,
 dedupingInterval: 60000
 });

 return {
 studioResumes: data || [],
 isLoading,
 isError: error,
 mutate
 };
}
