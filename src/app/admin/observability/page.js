'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ShieldAlert, Activity, CheckCircle, XCircle, Clock, 
  Users, Zap, Bell, GitBranch, AlertTriangle, RefreshCw 
} from 'lucide-react';
import api from '@/lib/api';

export default function ObservabilityDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const router = useRouter();

  const fetchMetrics = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data } = await api.get('/admin/metrics');
      setMetrics(data.metrics);
      setLastRefresh(new Date());
    } catch (err) {
      if (err.response?.status === 403) setError('Forbidden: Requires ADMIN role');
      else setError('Failed to load metrics.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400 max-w-md">{error}</p>
        <button onClick={() => router.push('/dashboard')}
          className="mt-6 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const m = metrics;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-8">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Activity className="w-7 h-7 text-emerald-500" />
            Platform Observability
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Auto-refreshes every 30s · Last: {lastRefresh?.toLocaleTimeString() || '—'}
          </p>
        </div>
        <button onClick={fetchMetrics} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
          <RefreshCw className="w-5 h-5 text-gray-400" />
        </button>
      </header>

      {/* Row 1: Core metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Jobs */}
        <MetricCard title="AI Jobs Today" icon={<Zap className="w-4 h-4 text-emerald-400" />}>
          <StatRow label="Completed" value={m?.jobs?.COMPLETED} color="text-emerald-400" icon={<CheckCircle className="w-3.5 h-3.5" />} />
          <StatRow label="Failed" value={m?.jobs?.FAILED} color="text-red-400" icon={<XCircle className="w-3.5 h-3.5" />} />
          <StatRow label="Queued" value={(m?.jobs?.PENDING || 0) + (m?.jobs?.PROCESSING || 0)} color="text-yellow-400" icon={<Clock className="w-3.5 h-3.5" />} />
          <div className="pt-3 mt-3 border-t border-gray-800 flex justify-between text-xs">
            <span className="text-gray-500">Failure Rate</span>
            <span className="text-red-400 font-mono">{m?.jobs?.failureRate || '0%'}</span>
          </div>
        </MetricCard>

        {/* Tokens */}
        <MetricCard title="Token Usage" icon={<Activity className="w-4 h-4 text-blue-400" />}>
          <StatRow label="Prompt" value={m?.tokens?.prompt?.toLocaleString()} />
          <StatRow label="Completion" value={m?.tokens?.completion?.toLocaleString()} />
          <StatRow label="Generations" value={m?.tokens?.totalGenerations} />
          <div className="pt-3 mt-3 border-t border-gray-800 flex justify-between">
            <span className="text-emerald-400 text-sm font-medium">Est. Cost</span>
            <span className="font-mono text-emerald-400 font-bold">${m?.tokens?.costUsd || '0.0000'}</span>
          </div>
        </MetricCard>

        {/* Performance */}
        <MetricCard title="Avg Latency" icon={<Clock className="w-4 h-4 text-purple-400" />}>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-4xl font-bold">{Math.round((m?.tokens?.avgLatencyMs || 0) / 1000)}</span>
            <span className="text-gray-500 mb-1 text-sm">sec / job</span>
          </div>
          {m?.staleJobsRecovered > 0 && (
            <div className="mt-4 text-xs text-yellow-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {m.staleJobsRecovered} stale jobs recovered
            </div>
          )}
        </MetricCard>

        {/* Users */}
        <MetricCard title="Users" icon={<Users className="w-4 h-4 text-cyan-400" />}>
          <StatRow label="New Today" value={m?.users?.newSignupsToday} color="text-cyan-400" />
          <StatRow label="Total" value={m?.users?.totalUsers} />
          <StatRow label="Active Workflows" value={m?.workflows?.activeCount} color="text-purple-400" icon={<GitBranch className="w-3.5 h-3.5" />} />
          <StatRow label="Unread Notifs" value={m?.notifications?.unreadCount} color="text-yellow-400" icon={<Bell className="w-3.5 h-3.5" />} />
        </MetricCard>
      </div>

      {/* Row 2: Provider Breakdown */}
      {m?.providers && Object.keys(m.providers).length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Provider Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(m.providers).map(([name, data]) => (
              <div key={name} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-mono text-emerald-400 mb-3">{name}</h3>
                <StatRow label="Generations" value={data.count} />
                <StatRow label="Cost (USD)" value={`$${data.costUsd?.toFixed(4)}`} color="text-emerald-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 3: Recent Failures */}
      {m?.recentFailures?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Recent Failures
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Error</th>
                  <th className="text-left p-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {m.recentFailures.map((f) => (
                  <tr key={f.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="p-3 font-mono text-xs text-yellow-400">{f.type}</td>
                    <td className="p-3 text-red-300 text-xs max-w-xs truncate">{f.errorMessage?.substring(0, 80) || '—'}</td>
                    <td className="p-3 text-gray-500 text-xs whitespace-nowrap">{new Date(f.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, icon, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-2">{icon}{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function StatRow({ label, value, color = 'text-gray-300', icon = null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={`flex items-center gap-1.5 ${color}`}>{icon}{label}</span>
      <span className="font-mono font-medium">{value ?? 0}</span>
    </div>
  );
}
