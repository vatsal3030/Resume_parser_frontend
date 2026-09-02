"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageShell } from '@/components/ui/PageShell';
import { useToast } from '@/components/ui/toast';
import { Trophy, Code, Loader2, RefreshCw, Save, ExternalLink, TrendingUp, Target, Zap, Award } from 'lucide-react';

const PLATFORMS = [
  { key: 'leetcode', label: 'LeetCode', icon: '🟡', url: 'https://leetcode.com' },
  { key: 'codeforces', label: 'Codeforces', icon: '🔵', url: 'https://codeforces.com' },
  { key: 'gfg', label: 'GeeksForGeeks', icon: '🟢', url: 'https://geeksforgeeks.org' },
  { key: 'codechef', label: 'CodeChef', icon: '🟠', url: 'https://codechef.com' },
  { key: 'hackerrank', label: 'HackerRank', icon: '🟩', url: 'https://hackerrank.com' },
];

const CODEFORCES_RANK_COLORS = {
  'newbie': 'text-gray-400',
  'pupil': 'text-emerald-500',
  'specialist': 'text-cyan-500',
  'expert': 'text-blue-500',
  'candidate master': 'text-violet-500',
  'master': 'text-amber-500',
  'international master': 'text-orange-500',
  'grandmaster': 'text-red-500',
  'international grandmaster': 'text-red-600',
  'legendary grandmaster': 'text-red-700',
};

export default function DSATrackerPage() {
  const [usernames, setUsernames] = useState({ leetcode: '', codeforces: '', gfg: '', codechef: '', hackerrank: '' });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/users/me');
        const dsa = data?.profile?.dsaPlatforms || {};
        setUsernames({
          leetcode: dsa.leetcode || '',
          codeforces: dsa.codeforces || '',
          gfg: dsa.gfg || '',
          codechef: dsa.codechef || '',
          hackerrank: dsa.hackerrank || '',
        });
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
    if (!u.leetcode && !u.codeforces && !u.gfg && !u.codechef && !u.hackerrank) {
      toast.warning('No Usernames', 'Enter at least one platform username.');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (u.leetcode) params.append('leetcode', u.leetcode);
      if (u.codeforces) params.append('codeforces', u.codeforces);
      if (u.gfg) params.append('gfg', u.gfg);
      if (u.codechef) params.append('codechef', u.codechef);
      if (u.hackerrank) params.append('hackerrank', u.hackerrank);
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
        <div className="space-y-6 animate-pulse">
          {/* Skeleton for platform inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-(--surface-soft)" />
                  <div className="h-3.5 bg-(--surface-soft) rounded-md w-20" />
                </div>
                <div className="h-9 bg-(--surface-soft) rounded-xl border border-(--hairline-soft)" />
              </div>
            ))}
          </div>

          {/* Skeleton for stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 text-center shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-lg bg-(--surface-soft) mx-auto" />
                <div className="h-8 bg-(--surface-soft) rounded-lg w-16 mx-auto" />
                <div className="h-2.5 bg-(--surface-soft) rounded w-20 mx-auto" />
              </div>
            ))}
          </div>

          {/* Skeleton for platform detail cards */}
          {[1, 2].map(i => (
            <div key={i} className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-(--hairline-soft) pb-4">
                <div className="w-8 h-8 rounded-xl bg-(--surface-soft)" />
                <div className="space-y-1.5">
                  <div className="h-4 bg-(--surface-soft) rounded-md w-28" />
                  <div className="h-2.5 bg-(--surface-soft) rounded w-16" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="p-4 rounded-xl border border-(--hairline-soft) bg-(--surface-soft) text-center space-y-2">
                    <div className="h-6 bg-(--surface-card) rounded-md w-12 mx-auto" />
                    <div className="h-2.5 bg-(--surface-card) rounded w-14 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="DSA Tracker" 
      subtitle="Track LeetCode, Codeforces & GFG progress in one unified dashboard"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => fetchStats()} disabled={loading} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      }
    >
      {/* Platform Username Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {PLATFORMS.map(p => (
          <div key={p.key} className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{p.icon}</span>
                <h3 className="font-serif font-medium text-xs text-(--ink)">{p.label}</h3>
              </div>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-(--muted) hover:text-(--ink) transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <input
              type="text"
              value={usernames[p.key]}
              onChange={(e) => setUsernames(prev => ({ ...prev, [p.key]: e.target.value }))}
              placeholder={`Enter username`}
              className="w-full px-3 py-2 rounded-xl border border-(--hairline) bg-(--surface-soft) text-xs text-(--ink) placeholder:text-(--muted-soft) outline-none focus:border-(--primary) transition-colors shadow-xs"
            />
          </div>
        ))}
      </div>

      {/* Save & Fetch Buttons */}
      <div className="flex gap-3 mb-6">
        <Button onClick={handleSave} disabled={saving} className="text-xs px-4">
          <Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? 'Saving...' : 'Save & Fetch Stats'}
        </Button>
      </div>

      {/* Aggregated Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 text-center shadow-xs">
            <Trophy className="w-6 h-6 text-(--primary) mx-auto mb-1.5" />
            <p className="text-2xl font-serif font-medium text-(--ink)">{stats.aggregated.totalSolved}</p>
            <p className="text-[11px] text-(--muted) mt-0.5">Total Solved</p>
          </div>
          <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 text-center shadow-xs">
            <Target className="w-6 h-6 text-(--primary) mx-auto mb-1.5" />
            <p className="text-2xl font-serif font-medium text-(--ink)">{stats.aggregated.platformCount}</p>
            <p className="text-[11px] text-(--muted) mt-0.5">Active Platforms</p>
          </div>
          {/* LeetCode-specific stats */}
          {stats.platforms.find(p => p.platform === 'LeetCode' && p.available) && (() => {
            const lc = stats.platforms.find(p => p.platform === 'LeetCode');
            return (
              <>
                <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 text-center shadow-xs">
                  <Zap className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                  <p className="text-2xl font-serif font-medium text-(--ink)">{lc.ranking > 0 ? `#${lc.ranking.toLocaleString()}` : '—'}</p>
                  <p className="text-[11px] text-(--muted) mt-0.5">LC Ranking</p>
                </div>
                <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 text-center shadow-xs">
                  <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-2xl font-serif font-medium text-(--ink)">{lc.acceptanceRate ? `${lc.acceptanceRate}%` : '—'}</p>
                  <p className="text-[11px] text-(--muted) mt-0.5">Acceptance</p>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Platform Detail Cards */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-(--hairline-soft) pb-4">
                <div className="w-8 h-8 rounded-xl bg-(--surface-soft)" />
                <div className="space-y-1">
                  <div className="h-4 bg-(--surface-soft) rounded w-28" />
                  <div className="h-2.5 bg-(--surface-soft) rounded w-20" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="p-3.5 rounded-xl border border-(--hairline-soft) bg-(--surface-soft) text-center space-y-1">
                    <div className="h-5 bg-(--surface-card) rounded w-12 mx-auto" />
                    <div className="h-2.5 bg-(--surface-card) rounded w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {stats.platforms.map(platform => (
            <div key={platform.platform} className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6 border-b border-(--hairline-soft) pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{PLATFORMS.find(p => p.label === platform.platform)?.icon || '📊'}</span>
                  <div>
                    <h3 className="font-serif font-medium text-base text-(--ink)">{platform.platform}</h3>
                    <a href={
                      platform.platform === 'LeetCode' ? `https://leetcode.com/u/${platform.username}` :
                      platform.platform === 'Codeforces' ? `https://codeforces.com/profile/${platform.username}` :
                      `https://www.geeksforgeeks.org/user/${platform.username}/`
                    } 
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium text-(--primary) hover:underline flex items-center gap-1 mt-0.5">
                      @{platform.username} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                {!platform.available && (
                  <span className="text-[11px] font-medium bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full border border-red-500/20">
                    {platform.error || 'Not Found'}
                  </span>
                )}
              </div>

              {platform.available && (
                <>
                  {/* LeetCode specific */}
                  {platform.platform === 'LeetCode' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <StatBox label="Total Solved" value={platform.totalSolved} />
                      <StatBox label="Easy" value={platform.easySolved} />
                      <StatBox label="Medium" value={platform.mediumSolved} />
                      <StatBox label="Hard" value={platform.hardSolved} />
                    </div>
                  )}

                  {/* Codeforces specific */}
                  {platform.platform === 'Codeforces' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <StatBox label="Total Solved" value={platform.totalSolved || 0} />
                        <StatBox label="Rating" value={platform.rating} />
                        <StatBox label="Max Rating" value={platform.maxRating} />
                        <StatBox label="Contests" value={platform.contestCount} />
                        <StatBox label="Contribution" value={platform.contribution} />
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-xs font-medium text-(--muted)">
                        <Award className="w-4 h-4 text-(--primary)" />
                        <span>Rank:</span>
                        <span className={`font-semibold ${CODEFORCES_RANK_COLORS[platform.rank] || 'text-(--ink)'}`}>
                          {platform.rank}
                        </span>
                        {platform.maxRank !== platform.rank && (
                          <span className="text-[11px] text-(--muted-soft)">(Max: {platform.maxRank})</span>
                        )}
                      </div>
                      
                      {/* Rating History */}
                      {platform.ratingHistory?.length > 0 && (
                        <div className="mt-5">
                          <h4 className="text-xs font-medium text-(--ink) mb-2.5">Recent Contests</h4>
                          <div className="space-y-1.5 max-h-60 overflow-y-auto">
                            {platform.ratingHistory.slice(-5).reverse().map((r, i) => (
                              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-(--surface-soft) border border-(--hairline-soft) text-xs">
                                <span className="font-medium text-(--ink) truncate flex-1">{r.contestName}</span>
                                <span className="text-(--muted) mx-3">#{r.rank}</span>
                                <span className={`font-semibold ${r.newRating > r.oldRating ? 'text-emerald-500' : 'text-red-500'}`}>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <StatBox label="Total Solved" value={platform.totalSolved} />
                      <StatBox label="Easy" value={platform.easySolved} />
                      <StatBox label="Medium" value={platform.mediumSolved} />
                      <StatBox label="Hard" value={platform.hardSolved} />
                    </div>
                  )}

                  {/* CodeChef specific */}
                  {platform.platform === 'CodeChef' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatBox label="Total Solved" value={platform.totalSolved ?? '—'} />
                        <StatBox label="Rating" value={platform.rating} />
                        <StatBox label="Max Rating" value={platform.maxRating} />
                        <StatBox label="Stars" value={platform.stars} />
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs font-medium text-(--muted)">
                        <Award className="w-4 h-4 text-(--primary)" />
                        <span>Global Rank:</span>
                        <span className="font-semibold text-(--ink)">{platform.globalRank || '—'}</span>
                        {platform.countryRank && (
                          <span className="text-[11px] text-(--muted-soft)">(Country: #{platform.countryRank})</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* HackerRank specific */}
                  {platform.platform === 'HackerRank' && (
                    <div className="space-y-3">
                      {platform.badges?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {platform.badges.map((b, i) => (
                            <div key={i} className="p-3 rounded-xl border border-(--hairline-soft) bg-(--surface-soft) text-center">
                              <p className="text-xl font-serif font-medium text-(--ink)">{b.score ?? '—'}</p>
                              <p className="text-[10px] text-(--muted) mt-1">{b.name}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-(--muted)">No badge data available.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border border-dashed border-(--hairline) bg-(--surface-card)">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-(--muted) opacity-40" />
          <h2 className="text-base font-serif font-medium text-(--ink) mb-1">No Data Yet</h2>
          <p className="text-xs text-(--muted)">Enter your platform usernames above and click &quot;Save &amp; Fetch Stats&quot; to see your competitive programming analytics.</p>
        </div>
      )}
    </PageShell>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="p-3.5 rounded-xl border border-(--hairline-soft) bg-(--surface-soft) text-center shadow-xs">
      <p className="text-xl font-serif font-medium text-(--ink)">{value ?? '—'}</p>
      <p className="text-[10px] text-(--muted) mt-0.5">{label}</p>
    </div>
  );
}
