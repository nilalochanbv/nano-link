import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Globe,
  Monitor,
  Chrome,
  ArrowUpDown,
  History,
  AlertCircle
} from 'lucide-react';

// Chart colors
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

interface VisitRecord {
  id: string;
  visitedAt: string;
  ipAddress: string | null;
  browser: string | null;
  device: string | null;
  operatingSystem: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  url: {
    shortCode: string;
    originalUrl: string;
  };
}

export const AnalyticsPage: React.FC = () => {
  const [selectedLink, setSelectedLink] = useState<string>('global');

  // Fetch all user URLs to populate dropdown
  const { data: urls } = useQuery({
    queryKey: ['urls-dropdown'],
    queryFn: async () => {
      const res = await api.get('/urls');
      return res.data.data.urls as any[];
    },
  });

  // Query analytics details
  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ['analytics', selectedLink],
    queryFn: async () => {
      const endpoint =
        selectedLink === 'global'
          ? '/analytics/dashboard'
          : `/analytics/link/${selectedLink}`;
      const res = await api.get(endpoint);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent"></div>
        <p className="text-xs">Loading analytics data...</p>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="py-16 text-center text-rose-500 font-semibold text-sm">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        Failed to retrieve analytics reports.
      </div>
    );
  }

  // Formatting structures
  const summary = analytics.summary;
  const recentVisits = (analytics.recentVisits || []) as VisitRecord[];
  
  // Recharts data
  const trendData = analytics.dailyTrends || [];
  const countryData = analytics.topCountries || [];
  const browserData = analytics.topBrowsers || [];
  const deviceData = analytics.topDevices || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track links efficiency, geographic click points, and visitor configurations.
          </p>
        </div>

        {/* Link Filter Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLink}
            onChange={(e) => setSelectedLink(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-2.5 px-4 text-xs font-semibold focus:outline-none shadow-sm"
          >
            <option value="global">All Links (Global Analytics)</option>
            {urls?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.customAlias ? `/r/${u.customAlias}` : `/r/${u.shortCode}`} ({u.clickCount} clicks)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
            <ArrowUpDown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Clicks</p>
            <h3 className="text-2xl font-extrabold mt-0.5">{summary.totalClicks}</h3>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Last Visited</p>
            <h3 className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
              {summary.lastVisited
                ? new Date(summary.lastVisited).toLocaleString()
                : 'No visits logged yet'}
            </h3>
          </div>
        </div>

        {selectedLink === 'global' && summary.mostPopularLink && (
          <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Most Popular URL</p>
              <h3 className="text-sm font-bold mt-1 truncate text-slate-805 dark:text-slate-200">
                /r/{summary.mostPopularLink.customAlias || summary.mostPopularLink.shortCode}
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5">
                {summary.mostPopularLink.clickCount} total clicks
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Click Timeline Trend (Span 2) */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-6">
            Click Trends (Last 7 Days)
          </h3>
          <div className="h-64">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="count" name="Clicks" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trend metrics recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Top Devices Distribution */}
        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-6 flex items-center gap-2">
            <Monitor className="h-4 w-4" /> Device Breakdown
          </h3>
          <div className="h-60 flex items-center justify-center relative">
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="device"
                  >
                    {deviceData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No device records found.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Metrics */}
        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-6 flex items-center gap-2">
            <Globe className="h-4 w-4" /> Top Geographic Sources
          </h3>
          <div className="h-64">
            {countryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.1)" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis dataKey="country" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="count" name="Clicks" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No geographical metrics logged.
              </div>
            )}
          </div>
        </div>

        {/* Browser breakdown */}
        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-6 flex items-center gap-2">
            <Chrome className="h-4 w-4" /> Browser Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    dataKey="count"
                    nameKey="browser"
                    style={{ fontSize: '9px', fontWeight: 'bold' }}
                  >
                    {browserData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No browser records found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-850 flex items-center gap-2">
          <History className="h-4.5 w-4.5 text-slate-405" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-550 dark:text-slate-400">
            Recent Redirections
          </h3>
        </div>

        {recentVisits.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No clicks recorded yet for this URL scope.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 font-semibold text-slate-500">
                  <th className="py-3.5 px-6">Timestamp</th>
                  {selectedLink === 'global' && <th className="py-3.5 px-6">Link Alias</th>}
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6">Browser / OS</th>
                  <th className="py-3.5 px-6">Device</th>
                  <th className="py-3.5 px-6">Geographic Source</th>
                  <th className="py-3.5 px-6">Referrer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
                {recentVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/10">
                    <td className="py-3.5 px-6 font-medium">
                      {new Date(v.visitedAt).toLocaleString()}
                    </td>
                    {selectedLink === 'global' && (
                      <td className="py-3.5 px-6 font-semibold text-indigo-650 dark:text-indigo-400">
                        /{v.url.shortCode}
                      </td>
                    )}
                    <td className="py-3.5 px-6 font-mono text-[10px]">{v.ipAddress}</td>
                    <td className="py-3.5 px-6">
                      {v.browser} ({v.operatingSystem})
                    </td>
                    <td className="py-3.5 px-6 capitalize">{v.device}</td>
                    <td className="py-3.5 px-6 font-semibold">
                      {v.city ? `${v.city}, ` : ''}{v.country || 'Unknown'}
                    </td>
                    <td className="py-3.5 px-6 truncate max-w-[120px]" title={v.referrer || 'Direct'}>
                      {v.referrer || 'Direct'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
