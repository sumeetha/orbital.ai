import { TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, Badge } from '../../components/ui';
import { mockKpis, mockRiskSignals, mockEngagementPerformance } from '../../mock/insights';

function Sparkline({ data, color = '#7c5cfc' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

const severityColors = {
  high: 'red' as const,
  medium: 'amber' as const,
  low: 'slate' as const,
};

export function InsightsPage() {
  return (
    <div>
      <PageHeader
        title="Insights"
        subtitle="Key metrics and risk signals based on your setup"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {mockKpis.map((kpi) => (
          <Card key={kpi.id} className="p-5">
            <div className="text-sm text-orbital-text-muted mb-1">{kpi.label}</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-orbital-text-dark">{kpi.value}</div>
              <Sparkline data={kpi.trend} color={kpi.change >= 0 ? '#10b981' : '#ef4444'} />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {kpi.change >= 0 ? (
                <TrendingUp size={14} className="text-emerald-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
              <span className={`text-xs font-medium ${kpi.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {kpi.change >= 0 ? '+' : ''}{kpi.change}%
              </span>
              <span className="text-xs text-orbital-text-muted">vs last week</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Risk Signals */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-orbital-text-dark mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          Risk Signals
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {mockRiskSignals.map((signal) => (
            <Card key={signal.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-orbital-text-dark">{signal.label}</span>
                <Badge color={severityColors[signal.severity]}>
                  {signal.severity}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-orbital-text-dark mb-1">
                {signal.orgCount} <span className="text-sm font-normal text-orbital-text-muted">orgs</span>
              </div>
              <p className="text-xs text-orbital-text-muted">{signal.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Engagement Performance */}
      <div>
        <h2 className="text-lg font-semibold text-orbital-text-dark mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-orbital-primary" />
          Engagement Performance
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-orbital-border-light text-left text-orbital-text-muted">
                  <th className="px-4 py-3 font-medium">Engagement</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Impressions</th>
                  <th className="px-4 py-3 font-medium text-right">Completions</th>
                  <th className="px-4 py-3 font-medium text-right">Dismissals</th>
                  <th className="px-4 py-3 font-medium text-right">Conversion Lift</th>
                </tr>
              </thead>
              <tbody>
                {mockEngagementPerformance.map((ep) => (
                  <tr key={ep.engagementId} className="border-b border-orbital-border-light last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-orbital-text-dark">{ep.name}</td>
                    <td className="px-4 py-3">
                      <Badge color={ep.type === 'tour' ? 'blue' : ep.type === 'nudge' ? 'amber' : 'violet'}>
                        {ep.type === 'feedback' ? 'Feedback' : ep.type.charAt(0).toUpperCase() + ep.type.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-orbital-text-dark">{ep.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-orbital-text-dark">{ep.completions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-orbital-text-muted">{ep.dismissals.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-600 font-medium">+{ep.conversionLift}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
