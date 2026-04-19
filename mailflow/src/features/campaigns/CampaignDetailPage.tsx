import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Archive,
  ChevronDown,
  Pencil,
  Send,
  ExternalLink,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../../store';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { StatusChip } from '../../components/Badge';
import Tabs from '../../components/Tabs';
import KPIStat from '../../components/KPIStat';
import EmptyState from '../../components/EmptyState';
import { ORBITAL_IDS } from '../../orbital/ids';
import { formatNumber, formatPercent, computeRate } from '../../lib/formatters';
import { formatDateTime, formatDate } from '../../lib/dates';

const CHART_COLORS = {
  primary: '#0984e3',
  secondary: '#6366f1',
  tertiary: '#10b981',
  grid: '#f1f5f9',
  label: '#64748b',
};

function generateHourlyData(stats: { opens: number; clicks: number }) {
  const data = [];
  let cumulativeOpens = 0;
  let cumulativeClicks = 0;
  for (let h = 0; h < 24; h++) {
    const weight = h < 4 ? 0.08 - h * 0.015 : 0.005 + Math.random() * 0.02;
    const hourOpens = Math.floor(stats.opens * Math.max(weight, 0.003));
    const hourClicks = Math.floor(stats.clicks * Math.max(weight, 0.002));
    cumulativeOpens += hourOpens;
    cumulativeClicks += hourClicks;
    data.push({
      hour: `${h}:00`,
      opens: Math.min(cumulativeOpens, stats.opens),
      clicks: Math.min(cumulativeClicks, stats.clicks),
    });
  }
  return data;
}

const MOCK_LINKS = [
  { url: 'https://mailflow.demo/blog/getting-started', clicks: 234 },
  { url: 'https://mailflow.demo/pricing', clicks: 187 },
  { url: 'https://mailflow.demo/features/analytics', clicks: 142 },
  { url: 'https://mailflow.demo/docs/api-reference', clicks: 89 },
  { url: 'https://mailflow.demo/webinar-signup', clicks: 56 },
];

function generateMockContacts(page: number, perPage: number) {
  const firstNames = [
    'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Avery',
    'Blake', 'Drew', 'Sage', 'Reese', 'Parker', 'Hayden', 'Cameron', 'Dakota',
    'Emerson', 'Finley', 'Harper', 'Jamie',
  ];
  const lastNames = [
    'Chen', 'Patel', 'Nguyen', 'Smith', 'Garcia', 'Kim', 'Brown', 'Wilson',
    'Lopez', 'Lee', 'Taylor', 'Anderson', 'Thomas', 'Moore', 'Jackson', 'Martin',
    'White', 'Harris', 'Clark', 'Lewis',
  ];
  const start = page * perPage;
  return Array.from({ length: perPage }, (_, i) => {
    const idx = (start + i) % 20;
    const fn = firstNames[idx];
    const ln = lastNames[(idx + 7) % 20];
    return {
      id: `mock-contact-${start + i}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
      name: `${fn} ${ln}`,
      opened: Math.random() > 0.4,
      clicked: Math.random() > 0.7,
    };
  });
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, segments, sendCampaign, addToast } = useStore(
    useShallow((s) => ({
      campaigns: s.campaigns,
      segments: s.segments,
      sendCampaign: s.sendCampaign,
      addToast: s.addToast,
    })),
  );

  const campaign = campaigns.find((c) => c.id === id);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionsOpen, setActionsOpen] = useState(false);
  const [recipientPage, setRecipientPage] = useState(0);

  const segment = useMemo(
    () => (campaign ? segments.find((s) => s.id === campaign.audienceId) : undefined),
    [campaign, segments],
  );

  const hourlyData = useMemo(
    () =>
      campaign?.stats
        ? generateHourlyData(campaign.stats)
        : [],
    [campaign?.stats],
  );

  if (!campaign) {
    return (
      <div className="p-8">
        <EmptyState
          title="Campaign not found"
          description="The campaign you're looking for doesn't exist or has been removed."
          actionLabel="Back to campaigns"
          onAction={() => navigate('/campaigns')}
        />
      </div>
    );
  }

  const isSent = campaign.status === 'sent';
  const hasVariants = !!campaign.variants?.length;
  const audienceName = segment?.name ?? 'All contacts';

  const tabs = [
    { id: 'overview', label: 'Overview', orbitalId: ORBITAL_IDS.campaignDetailTabOverview },
    { id: 'links', label: 'Links', orbitalId: ORBITAL_IDS.campaignDetailTabLinks },
    { id: 'recipients', label: 'Recipients', orbitalId: ORBITAL_IDS.campaignDetailTabRecipients },
    ...(hasVariants
      ? [{ id: 'ab', label: 'A/B Results', orbitalId: ORBITAL_IDS.campaignDetailTabAb }]
      : []),
  ];

  const handleSendNow = () => {
    sendCampaign(campaign.id);
    navigate('/campaigns');
  };

  const recipientContacts = generateMockContacts(recipientPage, 20);
  const totalRecipientPages = 5;

  return (
    <div className="p-8 space-y-6">
      {/* Back link */}
      <Link
        to="/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
      >
        <ArrowLeft size={16} />
        Campaigns
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text">{campaign.name}</h1>
            <StatusChip status={campaign.status} />
          </div>
          <p className="text-sm text-text-muted">
            {campaign.sentAt
              ? `Sent ${formatDateTime(campaign.sentAt)}`
              : campaign.scheduledFor
                ? `Scheduled for ${formatDate(campaign.scheduledFor)}`
                : 'Draft'}
            {' · '}
            {audienceName}
          </p>
        </div>

        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActionsOpen(!actionsOpen)}
          >
            Actions
            <ChevronDown size={14} />
          </Button>
          {actionsOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-20 bg-white border border-border rounded-md shadow-lg py-1 min-w-[160px]"
              onMouseLeave={() => setActionsOpen(false)}
            >
              <button
                onClick={() => {
                  addToast('Campaign duplicated', 'success');
                  setActionsOpen(false);
                }}
                className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-slate-50"
              >
                <Copy size={14} className="text-text-muted" />
                Duplicate
              </button>
              <button
                onClick={() => {
                  addToast('Campaign archived', 'info');
                  setActionsOpen(false);
                }}
                className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Archive size={14} />
                Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Draft / Scheduled — non-analytics view */}
      {!isSent && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Campaign Summary</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-text-muted">Subject</dt>
              <dd className="font-medium text-text mt-0.5">{campaign.subject}</dd>
            </div>
            <div>
              <dt className="text-text-muted">From</dt>
              <dd className="font-medium text-text mt-0.5">
                {campaign.fromName} &lt;{campaign.fromEmail}&gt;
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Audience</dt>
              <dd className="font-medium text-text mt-0.5">{audienceName}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Template</dt>
              <dd className="font-medium text-text mt-0.5">{campaign.templateId}</dd>
            </div>
            {campaign.preheader && (
              <div className="col-span-2">
                <dt className="text-text-muted">Preheader</dt>
                <dd className="font-medium text-text mt-0.5">{campaign.preheader}</dd>
              </div>
            )}
          </dl>
          <div className="flex gap-3 mt-6 pt-4 border-t border-border">
            <Button
              variant="secondary"
              onClick={() => navigate(`/campaigns/new?edit=${campaign.id}`)}
            >
              <Pencil size={14} />
              Edit
            </Button>
            <Button
              onClick={handleSendNow}
              data-orbital-id={ORBITAL_IDS.campaignDetailSendNow}
            >
              <Send size={14} />
              Send now
            </Button>
          </div>
        </Card>
      )}

      {/* Sent — analytics view */}
      {isSent && campaign.stats && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPIStat label="Recipients" value={formatNumber(campaign.stats.recipients)} />
            <KPIStat label="Delivered" value={formatNumber(campaign.stats.delivered)} />
            <KPIStat
              label="Open rate"
              value={formatPercent(computeRate(campaign.stats.opens, campaign.stats.delivered))}
              subtext={`${formatNumber(campaign.stats.opens)} opens`}
            />
            <KPIStat
              label="Click rate"
              value={formatPercent(computeRate(campaign.stats.clicks, campaign.stats.delivered))}
              subtext={`${formatNumber(campaign.stats.clicks)} clicks`}
            />
            <KPIStat
              label="Bounce rate"
              value={formatPercent(computeRate(campaign.stats.bounces, campaign.stats.recipients))}
              subtext={`${formatNumber(campaign.stats.bounces)} bounces`}
            />
            <KPIStat
              label="Unsubscribes"
              value={formatNumber(campaign.stats.unsubscribes)}
            />
          </div>

          {/* Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <Card className="p-6">
              <h3 className="text-base font-semibold text-text mb-4">Opens & Clicks over 24 hours</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 12, fill: CHART_COLORS.label }}
                      tickLine={false}
                      axisLine={{ stroke: CHART_COLORS.grid }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: CHART_COLORS.label }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(79,70,229,.06)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="opens"
                      name="Opens"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: CHART_COLORS.primary }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      name="Clicks"
                      stroke={CHART_COLORS.secondary}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: CHART_COLORS.secondary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Links tab */}
          {activeTab === 'links' && (
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50/60">
                    <th className="text-left font-medium text-text-muted px-4 py-3">URL</th>
                    <th className="text-right font-medium text-text-muted px-4 py-3">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_LINKS.map((link) => (
                    <tr key={link.url} className="border-b border-border last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-primary hover:underline">
                          {link.url}
                          <ExternalLink size={12} />
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {formatNumber(link.clicks)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Recipients tab */}
          {activeTab === 'recipients' && (
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50/60">
                    <th className="text-left font-medium text-text-muted px-4 py-3">Name</th>
                    <th className="text-left font-medium text-text-muted px-4 py-3">Email</th>
                    <th className="text-center font-medium text-text-muted px-4 py-3">Opened</th>
                    <th className="text-center font-medium text-text-muted px-4 py-3">Clicked</th>
                  </tr>
                </thead>
                <tbody>
                  {recipientContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-text">{contact.name}</td>
                      <td className="px-4 py-2.5 text-text-muted">{contact.email}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${contact.opened ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${contact.clicked ? 'bg-primary' : 'bg-slate-300'}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-slate-50/40">
                <p className="text-xs text-text-muted">
                  Page {recipientPage + 1} of {totalRecipientPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={recipientPage === 0}
                    onClick={() => setRecipientPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={recipientPage >= totalRecipientPages - 1}
                    onClick={() => setRecipientPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* A/B Results tab */}
          {activeTab === 'ab' && hasVariants && campaign.variants && (
            <Card className="p-6">
              <h3 className="text-base font-semibold text-text mb-4">Variant Comparison</h3>
              <div className="mb-6 space-y-2">
                {campaign.variants.map((v, i) => (
                  <p key={v.id} className="text-sm text-text-muted">
                    <span className="font-medium text-text">Variant {String.fromCharCode(65 + i)}:</span>{' '}
                    {v.subject}
                  </p>
                ))}
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={campaign.variants.map((v, i) => ({
                      name: `Variant ${String.fromCharCode(65 + i)}`,
                      'Open rate': v.stats
                        ? parseFloat(computeRate(v.stats.opens, v.stats.delivered).toFixed(1))
                        : 0,
                      'Click rate': v.stats
                        ? parseFloat(computeRate(v.stats.clicks, v.stats.delivered).toFixed(1))
                        : 0,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: CHART_COLORS.label }}
                      tickLine={false}
                      axisLine={{ stroke: CHART_COLORS.grid }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: CHART_COLORS.label }}
                      tickLine={false}
                      axisLine={false}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(79,70,229,.06)',
                      }}
                      formatter={(value) => [`${Number(value)}%`, '']}
                    />
                    <Legend />
                    <Bar dataKey="Open rate" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Click rate" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
