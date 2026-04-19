import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, FileText, Bell } from 'lucide-react';
import { useStore } from '../../store';
import KPIStat from '../../components/KPIStat';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { StatusChip } from '../../components/Badge';
import { formatNumber, formatPercent, computeRate } from '../../lib/formatters';
import { formatDate, formatRelative } from '../../lib/dates';
import { ORBITAL_IDS } from '../../orbital/ids';

export default function DashboardPage() {
  const navigate = useNavigate();
  const campaigns = useStore((s) => s.campaigns);
  const contacts = useStore((s) => s.contacts);
  const notifications = useStore((s) => s.notifications);

  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.getTime();
  }, []);

  const sentCampaigns30d = useMemo(
    () =>
      campaigns.filter(
        (c) =>
          c.status === 'sent' &&
          c.sentAt &&
          new Date(c.sentAt).getTime() >= thirtyDaysAgo,
      ),
    [campaigns, thirtyDaysAgo],
  );

  const kpis = useMemo(() => {
    let totalRecipients = 0;
    let totalOpens = 0;
    let totalClicks = 0;

    for (const c of sentCampaigns30d) {
      if (c.stats) {
        totalRecipients += c.stats.recipients;
        totalOpens += c.stats.opens;
        totalClicks += c.stats.clicks;
      }
    }

    return {
      sent: totalRecipients,
      openRate: computeRate(totalOpens, totalRecipients),
      clickRate: computeRate(totalClicks, totalRecipients),
      subscribers: contacts.filter((c) => c.subscribed).length,
    };
  }, [sentCampaigns30d, contacts]);

  const recentCampaigns = useMemo(
    () =>
      campaigns
        .filter((c) => c.status === 'sent' || c.status === 'scheduled')
        .sort((a, b) => {
          const dateA = a.sentAt ?? a.scheduledFor ?? '';
          const dateB = b.sentAt ?? b.scheduledFor ?? '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
        .slice(0, 5),
    [campaigns],
  );

  const recentNotifications = useMemo(
    () =>
      [...notifications]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [notifications],
  );

  const hasCampaigns = campaigns.length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStat
          label="Emails sent (30d)"
          value={formatNumber(kpis.sent)}
          subtext={`${sentCampaigns30d.length} campaigns`}
          data-orbital-id={ORBITAL_IDS.dashboardKpiSent}
        />
        <KPIStat
          label="Avg open rate"
          value={formatPercent(kpis.openRate)}
          data-orbital-id={ORBITAL_IDS.dashboardKpiOpenRate}
        />
        <KPIStat
          label="Avg click rate"
          value={formatPercent(kpis.clickRate)}
          data-orbital-id={ORBITAL_IDS.dashboardKpiClickRate}
        />
        <KPIStat
          label="Total subscribers"
          value={formatNumber(kpis.subscribers)}
          data-orbital-id={ORBITAL_IDS.dashboardKpiSubscribers}
        />
      </div>

      {/* Quick start cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="p-5 flex items-center gap-4 hover:border-[#0984e3] transition-colors"
          onClick={() => navigate('/campaigns/new')}
          data-orbital-id={ORBITAL_IDS.dashboardQuickstartCreate}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0984e3] shrink-0">
            <Plus size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Create a campaign
            </p>
            <p className="text-xs text-slate-500">
              Reach your audience in minutes
            </p>
          </div>
        </Card>

        <Card
          className="p-5 flex items-center gap-4 hover:border-[#0984e3] transition-colors"
          onClick={() => navigate('/audiences?tab=import')}
          data-orbital-id={ORBITAL_IDS.dashboardQuickstartImport}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0984e3] shrink-0">
            <Upload size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Import contacts
            </p>
            <p className="text-xs text-slate-500">
              Upload a CSV or add manually
            </p>
          </div>
        </Card>

        <Card
          className="p-5 flex items-center gap-4 hover:border-[#0984e3] transition-colors"
          onClick={() => navigate('/templates')}
          data-orbital-id={ORBITAL_IDS.dashboardQuickstartTemplates}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0984e3] shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Browse templates
            </p>
            <p className="text-xs text-slate-500">
              Pick a design and customize it
            </p>
          </div>
        </Card>
      </div>

      {/* Main content: campaigns table + activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent campaigns — 2/3 width */}
        <div className="lg:col-span-2">
          {hasCampaigns ? (
            <Card
              className="overflow-hidden"
              data-orbital-id={ORBITAL_IDS.dashboardRecentCampaignsTable}
            >
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-900">
                  Recent campaigns
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium text-right">
                        Open rate
                      </th>
                      <th className="px-5 py-3 font-medium text-right">
                        Click rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentCampaigns.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/campaigns/${c.id}`)}
                      >
                        <td className="px-5 py-3 font-medium text-slate-900">
                          {c.name}
                        </td>
                        <td className="px-5 py-3">
                          <StatusChip status={c.status} />
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {formatDate(c.sentAt ?? c.scheduledFor ?? '')}
                        </td>
                        <td className="px-5 py-3 text-right text-slate-700">
                          {c.stats
                            ? formatPercent(
                                computeRate(
                                  c.stats.opens,
                                  c.stats.recipients,
                                ),
                              )
                            : '—'}
                        </td>
                        <td className="px-5 py-3 text-right text-slate-700">
                          {c.stats
                            ? formatPercent(
                                computeRate(
                                  c.stats.clicks,
                                  c.stats.recipients,
                                ),
                              )
                            : '—'}
                        </td>
                      </tr>
                    ))}
                    {recentCampaigns.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-8 text-center text-slate-400"
                        >
                          No sent or scheduled campaigns yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <EmptyState
                title="No campaigns yet"
                description="Send your first one in under 5 minutes."
                actionLabel="Create campaign"
                onAction={() => navigate('/campaigns/new')}
              />
            </Card>
          )}
        </div>

        {/* Activity feed — 1/3 width */}
        <div>
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
              <Bell size={16} className="text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900">
                Activity
              </h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {recentNotifications.map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <p className="text-sm text-slate-700">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatRelative(n.createdAt)}
                  </p>
                </li>
              ))}
              {recentNotifications.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-slate-400">
                  No recent activity.
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
