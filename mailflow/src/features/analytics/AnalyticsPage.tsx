import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useStore } from '../../store';
import Card from '../../components/Card';
import KPIStat from '../../components/KPIStat';
import EmptyState from '../../components/EmptyState';
import { ORBITAL_IDS } from '../../orbital/ids';
import { formatNumber, formatPercent, computeRate } from '../../lib/formatters';
import type { Campaign } from '../../types';

type DateRange = '7d' | '30d' | '90d' | 'custom';

const CHART_PRIMARY = '#0984e3';
const CHART_SECONDARY = '#6366f1';
const CHART_TERTIARY = '#10b981';

function daysInRange(range: DateRange): number {
  switch (range) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case 'custom': return 30;
  }
}

function isWithinRange(isoDate: string | undefined, days: number): boolean {
  if (!isoDate) return false;
  const cutoff = Date.now() - days * 86_400_000;
  return new Date(isoDate).getTime() >= cutoff;
}

function generateDailyData(sentCampaigns: Campaign[], days: number) {
  const points: { date: string; opens: number; clicks: number }[] = [];
  const totalOpens = sentCampaigns.reduce((a, c) => a + (c.stats?.opens ?? 0), 0);
  const totalClicks = sentCampaigns.reduce((a, c) => a + (c.stats?.clicks ?? 0), 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const jitter = 0.6 + Math.random() * 0.8;
    const dayShare = 1 / days;
    points.push({
      date: label,
      opens: Math.round(totalOpens * dayShare * jitter),
      clicks: Math.round(totalClicks * dayShare * jitter),
    });
  }
  return points;
}

export default function AnalyticsPage() {
  const campaigns = useStore((s) => s.campaigns);
  const [range, setRange] = useState<DateRange>('30d');

  const days = daysInRange(range);

  const sentCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === 'sent' && isWithinRange(c.sentAt, days)),
    [campaigns, days],
  );

  const aggregated = useMemo(() => {
    let sent = 0;
    let delivered = 0;
    let opens = 0;
    let clicks = 0;
    let unsubscribes = 0;

    for (const c of sentCampaigns) {
      if (!c.stats) continue;
      sent += c.stats.recipients;
      delivered += c.stats.delivered;
      opens += c.stats.opens;
      clicks += c.stats.clicks;
      unsubscribes += c.stats.unsubscribes;
    }

    return { sent, delivered, opens, clicks, unsubscribes };
  }, [sentCampaigns]);

  const dailyData = useMemo(() => generateDailyData(sentCampaigns, days), [sentCampaigns, days]);

  const topCampaigns = useMemo(() => {
    return [...sentCampaigns]
      .filter((c) => c.stats && c.stats.delivered > 0)
      .sort((a, b) => {
        const rateA = computeRate(a.stats!.opens, a.stats!.delivered);
        const rateB = computeRate(b.stats!.opens, b.stats!.delivered);
        return rateB - rateA;
      })
      .slice(0, 5)
      .map((c) => ({
        name: c.name.length > 25 ? c.name.slice(0, 22) + '…' : c.name,
        openRate: parseFloat(computeRate(c.stats!.opens, c.stats!.delivered).toFixed(1)),
      }));
  }, [sentCampaigns]);

  const funnel = useMemo(() => {
    const { sent, delivered, opens, clicks } = aggregated;
    const max = sent || 1;
    return [
      { label: 'Sent', value: sent, pct: 100, width: 100 },
      { label: 'Delivered', value: delivered, pct: computeRate(delivered, max), width: (delivered / max) * 100 },
      { label: 'Opened', value: opens, pct: computeRate(opens, max), width: (opens / max) * 100 },
      { label: 'Clicked', value: clicks, pct: computeRate(clicks, max), width: (clicks / max) * 100 },
    ];
  }, [aggregated]);

  const FUNNEL_COLORS = [CHART_PRIMARY, CHART_SECONDARY, CHART_TERTIARY, '#f59e0b'];

  if (campaigns.filter((c) => c.status === 'sent').length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<BarChart3 size={28} />}
          title="No analytics yet"
          description="Send your first campaign to start seeing analytics data here."
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Analytics</h1>
          <p className="text-sm text-text-muted mt-1">Cross-campaign performance overview</p>
        </div>

        {/* Date range selector */}
        <div className="flex gap-1" data-orbital-id={ORBITAL_IDS.analyticsDateRange}>
          {([
            { label: 'Last 7d', value: '7d' as DateRange },
            { label: 'Last 30d', value: '30d' as DateRange },
            { label: 'Last 90d', value: '90d' as DateRange },
            { label: 'Custom', value: 'custom' as DateRange },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors
                ${range === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPIStat label="Sent" value={formatNumber(aggregated.sent)} />
        <KPIStat label="Delivered" value={formatNumber(aggregated.delivered)} />
        <KPIStat
          label="Open rate"
          value={formatPercent(computeRate(aggregated.opens, aggregated.delivered))}
        />
        <KPIStat
          label="Click rate"
          value={formatPercent(computeRate(aggregated.clicks, aggregated.delivered))}
        />
        <KPIStat
          label="Unsubscribe rate"
          value={formatPercent(computeRate(aggregated.unsubscribes, aggregated.sent))}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line chart: Opens & Clicks over time */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Opens & Clicks over time
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  boxShadow: '0 1px 2px rgba(15,23,42,.04),0 4px 12px rgba(79,70,229,.06)',
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: '#64748b' }}
              />
              <Line
                type="monotone"
                dataKey="opens"
                name="Opens"
                stroke={CHART_PRIMARY}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: CHART_PRIMARY }}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                name="Clicks"
                stroke={CHART_SECONDARY}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: CHART_SECONDARY }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar chart: Top 5 campaigns by open rate */}
        <Card className="p-5" data-orbital-id={ORBITAL_IDS.analyticsTopCampaigns}>
          <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-secondary" />
            Top campaigns by open rate
          </h3>
          {topCampaigns.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topCampaigns} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value)}%`, 'Open rate']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    boxShadow: '0 1px 2px rgba(15,23,42,.04),0 4px 12px rgba(79,70,229,.06)',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="openRate" fill={CHART_TERTIARY} radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-text-muted py-12 text-center">
              No campaign data for this period.
            </p>
          )}
        </Card>
      </div>

      {/* Funnel visualization */}
      <Card className="p-5" data-orbital-id={ORBITAL_IDS.analyticsFunnel}>
        <h3 className="text-sm font-semibold text-text mb-5">
          Funnel: Sent → Delivered → Opened → Clicked
        </h3>
        <div className="space-y-3">
          {funnel.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <span className="text-xs font-medium text-text-muted w-20 text-right shrink-0">
                {step.label}
              </span>
              <div className="flex-1 relative h-9">
                <div
                  className="h-full rounded-md transition-all duration-500"
                  style={{
                    width: `${Math.max(step.width, 2)}%`,
                    backgroundColor: FUNNEL_COLORS[i],
                    opacity: 0.85,
                  }}
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-white mix-blend-difference">
                  {formatNumber(step.value)}
                </span>
              </div>
              <span className="text-xs tabular-nums text-text-muted w-14 shrink-0">
                {formatPercent(step.pct)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
