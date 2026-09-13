"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { 
  Users, 
  Cpu, 
  Coins, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Filter, 
  Plus, 
  Shield, 
  Zap, 
  Clock, 
  X, 
  BarChart3, 
  ListFilter,
  FileText,
  Layers,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'users' | 'logs'
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Users Management State
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [userSearch, setUserSearch] = useState("");
  const [userTier, setUserTier] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Credit Grant Modal State
  const [creditModalUser, setCreditModalUser] = useState(null);
  const [creditsToAdd, setCreditsToAdd] = useState(100);
  const [newTier, setNewTier] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [granting, setGranting] = useState(false);

  // Feature Usage Logs State
  const [logs, setLogs] = useState([]);
  const [logPagination, setLogPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logStatusFilter, setLogStatusFilter] = useState("");

  const toast = useToast();

  // 1. Fetch Metrics
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const { data } = await api.get('/admin/metrics');
      setMetrics(data?.metrics || data);
    } catch (err) {
      toast.error("Metrics Error", "Failed to fetch platform observability metrics.");
    } finally {
      setLoadingMetrics(false);
    }
  }, [toast]);

  // 2. Fetch Users
  const fetchUsers = useCallback(async (page = 1) => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', '15');
      if (userSearch) params.append('search', userSearch);
      if (userTier) params.append('tier', userTier);

      const { data } = await api.get(`/admin/users?${params.toString()}`);
      setUsers(data.users || []);
      setUserPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      toast.error("Users Error", "Failed to load user list.");
    } finally {
      setLoadingUsers(false);
    }
  }, [userSearch, userTier, toast]);

  // 3. Fetch Feature Usage Logs
  const fetchLogs = useCallback(async (page = 1) => {
    setLoadingLogs(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', '25');
      if (logStatusFilter) params.append('status', logStatusFilter);

      const { data } = await api.get(`/admin/feature-logs?${params.toString()}`);
      setLogs(data.logs || []);
      setLogPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      toast.error("Logs Error", "Failed to load feature logs.");
    } finally {
      setLoadingLogs(false);
    }
  }, [logStatusFilter, toast]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers(1);
    if (activeTab === "logs") fetchLogs(1);
  }, [activeTab, fetchUsers, fetchLogs]);

  // Handle Granting Credits
  const handleGrantCredits = async () => {
    if (!creditModalUser) return;
    setGranting(true);
    try {
      const payload = {
        creditsToAdd: Number(creditsToAdd),
        reason: creditReason
      };
      if (newTier) payload.newTier = newTier;

      const { data } = await api.patch(`/admin/users/${creditModalUser.id}/credits`, payload);
      
      // Update local state in table
      setUsers(prev => prev.map(u => u.id === creditModalUser.id ? { 
        ...u, 
        credits: data.user.credits,
        tier: data.user.tier 
      } : u));

      toast.success(
        "Credits Allocated", 
        `Successfully ${creditsToAdd >= 0 ? 'granted +' + creditsToAdd : creditsToAdd} credits to ${creditModalUser.email}. Balance: ${data.user.credits}.`
      );

      setCreditModalUser(null);
      setCreditReason("");
    } catch (err) {
      toast.error("Credit Update Failed", err.response?.data?.error || "Could not update user credits.");
    } finally {
      setGranting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--hairline) pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-(--ink)">
            Platform Observability & Control
          </h1>
          <p className="text-xs text-(--muted) mt-1">
            Real-time analytics, user accounts directory, feature usage telemetry, and credit management.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-(--surface-card) p-1 rounded-xl border border-(--hairline) shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "overview"
                ? "bg-(--primary) text-white shadow-xs"
                : "text-(--muted) hover:text-(--ink)"
            }`}
          >
            Metrics & Analytics
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "users"
                ? "bg-(--primary) text-white shadow-xs"
                : "text-(--muted) hover:text-(--ink)"
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "logs"
                ? "bg-(--primary) text-white shadow-xs"
                : "text-(--muted) hover:text-(--ink)"
            }`}
          >
            Feature Activity Logs
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & ANALYTICS                                              */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-(--muted)">Total Users</span>
                <div className="w-8 h-8 rounded-xl bg-(--primary)/10 text-(--primary) border border-(--primary)/20 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-serif font-medium text-(--ink)">
                {metrics?.users?.totalUsers ?? '—'}
              </p>
              <p className="text-[11px] text-emerald-500 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +{metrics?.users?.newSignupsToday ?? 0} today
              </p>
            </Card>

            <Card className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-(--muted)">Active AI Jobs (Today)</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-serif font-medium text-(--ink)">
                {metrics?.jobs?.total ?? '—'}
              </p>
              <p className="text-[11px] text-(--muted) font-medium mt-1">
                {metrics?.jobs?.COMPLETED ?? 0} finished · Failure: {metrics?.jobs?.failureRate || '0%'}
              </p>
            </Card>

            <Card className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-(--muted)">Credits in Circulation</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-serif font-medium text-(--ink)">
                {metrics?.users?.totalCredits ? metrics.users.totalCredits.toLocaleString() : '—'}
              </p>
              <p className="text-[11px] text-(--muted) font-medium mt-1">
                Across all registered accounts
              </p>
            </Card>

            <Card className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-(--muted)">AI Latency & Cost</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-serif font-medium text-(--ink)">
                ${metrics?.tokens?.costUsd || '0.0000'}
              </p>
              <p className="text-[11px] text-(--muted) font-medium mt-1">
                Avg duration: {metrics?.tokens?.avgLatencyMs ? `${metrics.tokens.avgLatencyMs}ms` : '< 500ms'}
              </p>
            </Card>
          </div>

          {/* Graphs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 14-Day Growth & Execution History */}
            <Card className="lg:col-span-8 rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-base font-medium text-(--ink)">
                    14-Day Platform Traffic & Job Execution
                  </h3>
                  <p className="text-[11px] text-(--muted)">Daily user registrations vs AI background worker jobs</p>
                </div>
                <Button variant="secondary" size="sm" onClick={fetchMetrics} disabled={loadingMetrics} className="text-xs">
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingMetrics ? 'animate-spin' : ''}`} /> Refresh
                </Button>
              </div>

              <div className="h-72 w-full">
                {metrics?.charts?.timeSeries?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.charts.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#cc785c" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#cc785c" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.15)" vertical={false} />
                      <XAxis dataKey="displayDate" stroke="#888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--surface-card)', 
                          border: '1px solid var(--hairline)', 
                          borderRadius: '12px',
                          fontSize: '12px'
                        }} 
                      />
                      <Area type="monotone" dataKey="jobs" stroke="#cc785c" strokeWidth={2} fillOpacity={1} fill="url(#jobsGradient)" name="AI Jobs" />
                      <Area type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#usersGradient)" name="Signups" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-(--muted)">
                    No historical telemetry available yet.
                  </div>
                )}
              </div>
            </Card>

            {/* Feature Usage Distribution */}
            <Card className="lg:col-span-4 rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-base font-medium text-(--ink) mb-1">
                  Feature Demand Distribution
                </h3>
                <p className="text-[11px] text-(--muted) mb-4">Most executed AI career tools</p>

                <div className="space-y-3">
                  {metrics?.charts?.featureUsage?.length > 0 ? (
                    metrics.charts.featureUsage.map((feat, idx) => {
                      const total = metrics.charts.featureUsage.reduce((a, b) => a + b.count, 0) || 1;
                      const pct = Math.round((feat.count / total) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-(--ink) truncate">{feat.name}</span>
                            <span className="text-(--muted) font-mono">{feat.count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-(--surface-soft) rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-(--primary) rounded-full transition-all duration-500" 
                              style={{ width: `${Math.max(5, pct)}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 text-xs text-(--muted)">
                      No feature activity recorded in the last 14 days.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-(--hairline-soft) flex items-center justify-between text-[11px] text-(--muted)">
                <span>Stale Jobs Recovered:</span>
                <span className="font-mono text-emerald-500 font-medium">{metrics?.staleJobsRecovered || 0}</span>
              </div>
            </Card>
          </div>

          {/* AI Providers Breakdown Table */}
          <Card className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-xs">
            <h3 className="font-serif text-base font-medium text-(--ink) mb-1">
              Multi-Model AI Engine Performance
            </h3>
            <p className="text-[11px] text-(--muted) mb-4">Tokens, total requests, and costs aggregated by provider</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-(--hairline-soft) text-[11px] uppercase tracking-wider text-(--muted-soft)">
                    <th className="pb-3 font-medium">Provider / Family</th>
                    <th className="pb-3 font-medium">Total Calls</th>
                    <th className="pb-3 font-medium">Prompt Tokens</th>
                    <th className="pb-3 font-medium">Completion Tokens</th>
                    <th className="pb-3 font-medium text-right">Est. Cost (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--hairline-soft) text-xs">
                  {metrics?.providers && Object.keys(metrics.providers).length > 0 ? (
                    Object.entries(metrics.providers).map(([provider, info]) => (
                      <tr key={provider} className="hover:bg-(--surface-soft)/40 transition-colors">
                        <td className="py-3 font-medium text-(--ink) flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {provider}
                        </td>
                        <td className="py-3 text-(--body) font-mono">{info.count}</td>
                        <td className="py-3 text-(--muted) font-mono">{info.tokensPrompt?.toLocaleString() || 0}</td>
                        <td className="py-3 text-(--muted) font-mono">{info.tokensCompletion?.toLocaleString() || 0}</td>
                        <td className="py-3 text-right font-medium text-(--primary) font-mono">
                          ${info.costUsd?.toFixed(4) || '0.0000'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-(--muted)">
                        No provider telemetry recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER MANAGEMENT & CREDIT GRANTING                                 */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-(--surface-card) p-4 rounded-2xl border border-(--hairline) shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-80">
              <Search className="w-4 h-4 text-(--muted) shrink-0" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full bg-transparent text-xs text-(--ink) placeholder:text-(--muted-soft) outline-none"
              />
              {userSearch && (
                <button onClick={() => setUserSearch("")} className="text-(--muted) hover:text-(--ink)">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={userTier}
                onChange={(e) => setUserTier(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-(--hairline) bg-(--surface-soft) text-xs text-(--ink) outline-none"
              >
                <option value="">All Tiers</option>
                <option value="FREE">FREE Tier</option>
                <option value="PRO">PRO Tier</option>
              </select>

              <Button variant="secondary" size="sm" onClick={() => fetchUsers(1)} disabled={loadingUsers} className="text-xs">
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingUsers ? 'animate-spin' : ''}`} /> Search
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <Card className="rounded-2xl border border-(--hairline) bg-(--surface-card) shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-(--hairline-soft) bg-(--surface-soft)/40 text-[11px] uppercase tracking-wider text-(--muted-soft)">
                    <th className="p-4 font-medium">User Profile</th>
                    <th className="p-4 font-medium">Role / Tier</th>
                    <th className="p-4 font-medium">Credits Balance</th>
                    <th className="p-4 font-medium">Activity</th>
                    <th className="p-4 font-medium">Joined Date</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--hairline-soft) text-xs">
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-(--surface-soft)/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-(--surface-soft) border border-(--hairline) overflow-hidden shrink-0 flex items-center justify-center text-xs font-serif">
                              {u.profile?.avatarUrl ? (
                                <img src={u.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span>{(u.name || u.email)?.[0]?.toUpperCase()}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-(--ink) truncate">{u.name || 'User'}</p>
                              <p className="text-[11px] text-(--muted) truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-(--surface-soft) text-(--muted) border-(--hairline-soft)'
                            }`}>
                              {u.role}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              u.tier === 'PRO' ? 'bg-(--primary)/10 text-(--primary) border-(--primary)/20 font-semibold' : 'bg-(--surface-soft) text-(--muted) border-(--hairline-soft)'
                            }`}>
                              {u.tier}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-medium text-(--ink) text-sm">{u.credits?.toLocaleString() || 0}</span>
                          </div>
                        </td>

                        <td className="p-4 text-(--muted)">
                          <span title="Documents">{u._count?.documents || 0} docs</span> · <span title="AI Generations">{u._count?.aiJobs || 0} jobs</span>
                        </td>

                        <td className="p-4 text-(--muted-soft)">
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        <td className="p-4 text-right">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setCreditModalUser(u);
                              setCreditsToAdd(100);
                              setNewTier(u.tier);
                            }}
                            className="text-xs px-3 py-1 rounded-xl font-medium"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1 text-(--primary)" /> Grant Credits
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-xs text-(--muted)">
                        {loadingUsers ? 'Loading registered users...' : 'No users found matching query.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {userPagination.totalPages > 1 && (
              <div className="p-4 border-t border-(--hairline-soft) flex items-center justify-between text-xs text-(--muted)">
                <span>Page {userPagination.page} of {userPagination.totalPages} ({userPagination.total} users)</span>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={userPagination.page <= 1}
                    onClick={() => fetchUsers(userPagination.page - 1)}
                    className="text-xs"
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={userPagination.page >= userPagination.totalPages}
                    onClick={() => fetchUsers(userPagination.page + 1)}
                    className="text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FEATURE USAGE ACTIVITY MONITOR                                    */}
      {/* ========================================================================= */}
      {activeTab === "logs" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-(--surface-card) p-4 rounded-2xl border border-(--hairline) shadow-xs">
            <div>
              <h3 className="font-serif text-sm font-medium text-(--ink)">Live AI Execution Stream</h3>
              <p className="text-[11px] text-(--muted)">Telemetry for background worker tasks and interactive features</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-(--hairline) bg-(--surface-soft) text-xs text-(--ink) outline-none"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed Only</option>
                <option value="FAILED">Failed Only</option>
                <option value="PROCESSING">In Progress</option>
              </select>

              <Button variant="secondary" size="sm" onClick={() => fetchLogs(1)} disabled={loadingLogs} className="text-xs">
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingLogs ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>
          </div>

          <Card className="rounded-2xl border border-(--hairline) bg-(--surface-card) shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-(--hairline-soft) bg-(--surface-soft)/40 text-[11px] uppercase tracking-wider text-(--muted-soft)">
                    <th className="p-4 font-medium">Feature</th>
                    <th className="p-4 font-medium">User Account</th>
                    <th className="p-4 font-medium">AI Model</th>
                    <th className="p-4 font-medium">Latency</th>
                    <th className="p-4 font-medium">Tokens</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--hairline-soft) text-xs">
                  {logs.length > 0 ? (
                    logs.map((l) => (
                      <tr key={l.id} className="hover:bg-(--surface-soft)/40 transition-colors">
                        <td className="p-4 font-medium text-(--ink)">
                          {l.feature}
                        </td>
                        <td className="p-4 text-(--body) font-mono text-[11px] truncate max-w-[180px]">
                          {l.user}
                        </td>
                        <td className="p-4 text-(--muted) text-[11px]">
                          {l.model}
                        </td>
                        <td className="p-4 text-(--muted) font-mono text-[11px]">
                          {l.durationMs ? `${(l.durationMs / 1000).toFixed(1)}s` : '—'}
                        </td>
                        <td className="p-4 text-(--muted) font-mono text-[11px]">
                          {l.tokensTotal ? l.tokensTotal.toLocaleString() : '—'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            l.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            l.status === 'FAILED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="p-4 text-right text-(--muted-soft) text-[11px]">
                          {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-xs text-(--muted)">
                        {loadingLogs ? 'Streaming feature logs...' : 'No telemetry logs found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {logPagination.totalPages > 1 && (
              <div className="p-4 border-t border-(--hairline-soft) flex items-center justify-between text-xs text-(--muted)">
                <span>Page {logPagination.page} of {logPagination.totalPages} ({logPagination.total} logs)</span>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={logPagination.page <= 1}
                    onClick={() => fetchLogs(logPagination.page - 1)}
                    className="text-xs"
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={logPagination.page >= logPagination.totalPages}
                    onClick={() => fetchLogs(logPagination.page + 1)}
                    className="text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: 1-CLICK GRANT CREDITS & SET TIER                                  */}
      {/* ========================================================================= */}
      {creditModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-(--hairline-soft) pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-(--ink)">Allocate Credits</h3>
                <p className="text-xs text-(--muted) truncate">{creditModalUser.email}</p>
              </div>
              <button 
                onClick={() => setCreditModalUser(null)}
                className="p-1 text-(--muted) hover:text-(--ink) rounded-lg hover:bg-(--surface-soft)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-(--surface-soft) p-3 rounded-xl border border-(--hairline-soft) flex items-center justify-between text-xs">
              <span className="text-(--muted)">Current Balance:</span>
              <span className="font-mono font-medium text-sm text-(--ink)">{creditModalUser.credits?.toLocaleString() || 0} Credits</span>
            </div>

            {/* Preset Amount Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-(--muted)">Quick Increment</label>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCreditsToAdd(amt)}
                    className={`py-1.5 rounded-xl border text-xs font-mono font-medium transition-all ${
                      creditsToAdd === amt 
                        ? 'bg-(--primary) text-white border-(--primary) shadow-xs' 
                        : 'bg-(--surface-card) border-(--hairline) text-(--ink) hover:bg-(--surface-soft)'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-(--muted)">Amount to Add (or subtract)</label>
              <input
                type="number"
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-(--hairline) bg-(--surface-soft) text-sm font-mono text-(--ink) outline-none focus:border-(--primary)"
                placeholder="e.g. 500"
              />
            </div>

            {/* Optional Tier Change */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-(--muted)">Subscription Tier</label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-(--hairline) bg-(--surface-soft) text-xs text-(--ink) outline-none"
              >
                <option value="FREE">FREE Tier</option>
                <option value="PRO">PRO Tier</option>
              </select>
            </div>

            {/* Optional Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-(--muted)">Audit Reason (Optional)</label>
              <input
                type="text"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                placeholder="e.g. Community trial bonus, support adjustment"
                className="w-full p-2.5 rounded-xl border border-(--hairline) bg-(--surface-soft) text-xs text-(--ink) outline-none focus:border-(--primary)"
              />
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-(--hairline-soft)">
              <Button 
                variant="secondary" 
                className="flex-1 text-xs" 
                onClick={() => setCreditModalUser(null)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 text-xs" 
                disabled={granting}
                onClick={handleGrantCredits}
              >
                {granting ? 'Allocating...' : 'Confirm Allocation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
