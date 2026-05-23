"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageShell } from '@/components/ui/PageShell';
import { useToast } from '@/components/ui/toast';
import { Trophy, Code, Loader2, RefreshCw, Save, ExternalLink, TrendingUp, Target, Zap, Award } from 'lucide-react';

const PLATFORMS = [
  { key: 'leetcode', label: 'LeetCode', icon: '🟡', color: 'bg-yellow-100 border-yellow-400', url: 'https://leetcode.com' },
  { key: 'codeforces', label: 'Codeforces', icon: '🔵', color: 'bg-blue-100 border-blue-400', url: 'https://codeforces.com' },
  { key: 'gfg', label: 'GeeksForGeeks', icon: '🟢', color: 'bg-green-100 border-green-400', url: 'https://geeksforgeeks.org' },
];

const CODEFORCES_RANK_COLORS = {
  'newbie': 'text-gray-500',
  'pupil': 'text-green-500',
  'specialist': 'text-cyan-500',
  'expert': 'text-blue-500',
  'candidate master': 'text-violet-500',
  'master': 'text-orange-500',
  'international master': 'text-orange-600',
  'grandmaster': 'text-red-500',
  'international grandmaster': 'text-red-600',
  'legendary grandmaster': 'text-red-700',
};

export default function DSATrackerPage() {
  const [usernames, setUsernames] = useState({ leetcode: '', codeforces: '', gfg: '' });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const toast = useToast();

  // Load saved usernames on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/users/me');
        const dsa = data?.profile?.dsaPlatforms || {};
        setUsernames({
          leetcode: dsa.leetcode || '',
          codeforces: dsa.codeforces || '',
          gfg: dsa.gfg || '',
        });
        // Auto-fetch if usernames exist
        if (dsa.leetcode || dsa.codeforces || dsa.gfg) {
          fetchStats(dsa);
        }
      } catch (e) {
        console.error('Failed to load DSA profile:', e);
      } finally {
        setInitialLoad(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = useCallback(async (overrideUsernames) => {
    const u = overrideUsernames || usernames;
    if (!u.leetcode && !u.codeforces && !u.gfg) {
      toast.warning('No Usernames', 'Enter at least one platform username.');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (u.leetcode) params.append('leetcode', u.leetcode);
      if (u.codeforces) params.append('codeforces', u.codeforces);
      if (u.gfg) params.append('gfg', u.gfg);
      const { data } = await api.get(`/dsa/stats?${params}`);
      setStats(data);
    } catch (e) {
      toast.error('Fetch Failed', 'Could not retrieve DSA stats.');
    } finally {
      setLoading(false);
    }
  }, [usernames, toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/dsa/usernames', usernames);
      toast.success('Saved', 'Platform usernames saved.');
      fetchStats();
    } catch (e) {
      toast.error('Save Failed', 'Could not save usernames.');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoad) {
    return (
      <PageShell title="DSA Tracker" subtitle="Track your competitive programming progress">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-brutal-blue" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="DSA Tracker" 
      subtitle="Track LeetCode, Codeforces & GFG progress in one dashboard"
      subtitleColor="bg-brutal-green text-black"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchStats()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      }
    >
      {/* Platform Username Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLATFORMS.map(p => (
          <Card key={p.key} className={`border-4 border-brutal-black shadow-brutal ${p.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{p.icon}</span>
                <h3 className="font-black text-lg uppercase tracking-tight">{p.label}</h3>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="ml-auto opacity-50 hover:opacity-100">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <input
                type="text"
                value={usernames[p.key]}
                onChange={(e) => setUsernames(prev => ({ ...prev, [p.key]: e.target.value }))}
                placeholder={`Enter ${p.label} username`}
                className="w-full p-2 border-2 border-brutal-black font-medium text-sm outline-none focus:bg-white bg-white/70"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save & Fetch Buttons */}
      <div className="flex gap-3 mb-8">
        <Button variant="mint" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save & Fetch'}
        </Button>
      </div>

      {/* Aggregated Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4">
          <Card className="border-4 border-brutal-black shadow-brutal bg-brutal-yellow">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <p className="text-4xl font-black">{stats.aggregated.totalSolved}</p>
              <p className="text-xs font-bold uppercase tracking-wider mt-1">Total Solved</p>
            </CardContent>
          </Card>
          <Card className="border-4 border-brutal-black shadow-brutal bg-brutal-pink">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <p className="text-4xl font-black">{stats.aggregated.platformCount}</p>
              <p className="text-xs font-bold uppercase tracking-wider mt-1">Active Platforms</p>
            </CardContent>
          </Card>
          {/* LeetCode-specific stats */}
          {stats.platforms.find(p => p.platform === 'LeetCode' && p.available) && (() => {
            const lc = stats.platforms.find(p => p.platform === 'LeetCode');
            return (
              <>
                <Card className="border-4 border-brutal-black shadow-brutal bg-brutal-mint">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-4xl font-black">{lc.ranking > 0 ? `#${lc.ranking.toLocaleString()}` : '—'}</p>
                    <p className="text-xs font-bold uppercase tracking-wider mt-1">LC Ranking</p>
                  </CardContent>
                </Card>
                <Card className="border-4 border-brutal-black shadow-brutal bg-brutal-blue text-white">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-4xl font-black">{lc.acceptanceRate ? `${lc.acceptanceRate}%` : '—'}</p>
                    <p className="text-xs font-bold uppercase tracking-wider mt-1">Acceptance</p>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      )}

      {/* Platform Detail Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-brutal-blue" />
          <span className="ml-3 font-bold text-lg">Fetching stats from platforms...</span>
        </div>
      ) : stats ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
          {stats.platforms.map(platform => (
            <Card key={platform.platform} className="border-4 border-brutal-black shadow-brutal bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 border-b-4 border-brutal-black pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{PLATFORMS.find(p => p.label === platform.platform)?.icon || '📊'}</span>
                    <div>
                      <h3 className="text-2xl font-black">{platform.platform}</h3>
                      <a href={
                        platform.platform === 'LeetCode' ? `https://leetcode.com/u/${platform.username}` :
                        platform.platform === 'Codeforces' ? `https://codeforces.com/profile/${platform.username}` :
                        `https://www.geeksforgeeks.org/user/${platform.username}/`
                      } 
                         target="_blank" rel="noopener noreferrer"
                         className="text-sm font-bold text-brutal-blue hover:underline flex items-center gap-1">
                        @{platform.username} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  {!platform.available && (
                    <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 border-2 border-red-400">
                      {platform.error || 'Not Found'}
                    </span>
                  )}
                </div>

                {platform.available && (
                  <>
                    {/* LeetCode specific */}
                    {platform.platform === 'LeetCode' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatBox label="Total Solved" value={platform.totalSolved} color="bg-brutal-yellow" />
                        <StatBox label="Easy" value={platform.easySolved} color="bg-green-200" />
                        <StatBox label="Medium" value={platform.mediumSolved} color="bg-orange-200" />
                        <StatBox label="Hard" value={platform.hardSolved} color="bg-red-200" />
                      </div>
                    )}

                    {/* Codeforces specific */}
                    {platform.platform === 'Codeforces' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <StatBox label="Rating" value={platform.rating} color="bg-blue-200" />
                          <StatBox label="Max Rating" value={platform.maxRating} color="bg-purple-200" />
                          <StatBox label="Contests" value={platform.contestCount} color="bg-brutal-mint" />
                          <StatBox label="Contribution" value={platform.contribution} color="bg-brutal-yellow" />
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          <Award className="w-5 h-5" />
                          <span className="font-bold">Rank: </span>
                          <span className={`font-black text-lg uppercase ${CODEFORCES_RANK_COLORS[platform.rank] || 'text-gray-500'}`}>
                            {platform.rank}
                          </span>
                          {platform.maxRank !== platform.rank && (
                            <span className="text-xs text-gray-400 font-medium">(Max: {platform.maxRank})</span>
                          )}
                        </div>
                        
                        {/* Rating History */}
                        {platform.ratingHistory?.length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-black text-sm uppercase tracking-tight mb-3">Recent Contests</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {platform.ratingHistory.slice(-5).reverse().map((r, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 border-2 border-brutal-black text-sm">
                                  <span className="font-bold truncate flex-1">{r.contestName}</span>
                                  <span className="font-bold text-gray-500 mx-3">#{r.rank}</span>
                                  <span className={`font-black ${r.newRating > r.oldRating ? 'text-green-600' : 'text-red-500'}`}>
                                    {r.newRating > r.oldRating ? '+' : ''}{r.newRating - r.oldRating}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* GeeksForGeeks specific */}
                    {platform.platform === 'GeeksForGeeks' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatBox label="Total Solved" value={platform.totalSolved} color="bg-green-200" />
                        <StatBox label="Easy" value={platform.easySolved} color="bg-green-100" />
                        <StatBox label="Medium" value={platform.mediumSolved} color="bg-yellow-200" />
                        <StatBox label="Hard" value={platform.hardSolved} color="bg-red-200" />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-4 border-dashed border-brutal-black">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-black mb-2">No Data Yet</h2>
          <p className="font-bold text-gray-500 mb-4">Enter your platform usernames above and click &quot;Save &amp; Fetch&quot; to see your stats.</p>
        </div>
      )}
    </PageShell>
  );
}

function StatBox({ label, value, color = 'bg-gray-100' }) {
  return (
    <div className={`p-4 border-2 border-brutal-black ${color} text-center`}>
      <p className="text-3xl font-black">{value ?? '—'}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
