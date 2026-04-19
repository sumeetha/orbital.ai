import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Mail } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../../store';
import Button from '../../components/Button';
import { StatusChip } from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { ORBITAL_IDS } from '../../orbital/ids';
import { formatDate, formatDateTime } from '../../lib/dates';
import { formatPercent, computeRate } from '../../lib/formatters';

type StatusFilter = 'all' | 'draft' | 'scheduled' | 'sent';

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Sent', value: 'sent' },
];

export default function CampaignsListPage() {
  const navigate = useNavigate();
  const { campaigns, segments } = useStore(
    useShallow((s) => ({ campaigns: s.campaigns, segments: s.segments })),
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const segmentMap = useMemo(
    () => Object.fromEntries(segments.map((s) => [s.id, s.name])),
    [segments],
  );

  const filtered = useMemo(() => {
    let list = campaigns;
    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [campaigns, statusFilter, search]);

  if (campaigns.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<Mail size={28} />}
          title="You haven't created a campaign yet"
          description="Send your first email campaign in under 5 minutes. Pick a template, choose your audience, and hit send."
          actionLabel="Create campaign"
          onAction={() => navigate('/campaigns/new')}
          data-orbital-id={ORBITAL_IDS.campaignsListCreateBtn}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative max-w-xs w-full" data-orbital-id={ORBITAL_IDS.campaignsListSearch}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-white
                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                placeholder:text-slate-400"
            />
          </div>

          {/* Status filter chips */}
          <div className="flex gap-1" data-orbital-id={ORBITAL_IDS.campaignsListFilterStatus}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors
                  ${statusFilter === f.value
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => navigate('/campaigns/new')}
          data-orbital-id={ORBITAL_IDS.campaignsListCreateBtn}
        >
          <Plus size={16} />
          Create campaign
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-text-muted">
          No campaigns match your filters.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(79,70,229,0.06)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/60">
                <th className="text-left font-medium text-text-muted px-4 py-3">Name</th>
                <th className="text-left font-medium text-text-muted px-4 py-3">Status</th>
                <th className="text-left font-medium text-text-muted px-4 py-3">Audience</th>
                <th className="text-left font-medium text-text-muted px-4 py-3">Date</th>
                <th className="text-right font-medium text-text-muted px-4 py-3">Open rate</th>
                <th className="text-right font-medium text-text-muted px-4 py-3">Click rate</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const audience = segmentMap[c.audienceId] ?? 'All contacts';
                const date = c.sentAt
                  ? formatDateTime(c.sentAt)
                  : c.scheduledFor
                    ? formatDate(c.scheduledFor)
                    : '—';
                const openRate = c.stats
                  ? formatPercent(computeRate(c.stats.opens, c.stats.delivered))
                  : '—';
                const clickRate = c.stats
                  ? formatPercent(computeRate(c.stats.clicks, c.stats.delivered))
                  : '—';

                return (
                  <tr
                    key={c.id}
                    data-orbital-id={`campaigns-list-row-${c.id}`}
                    onClick={() => navigate(`/campaigns/${c.id}`)}
                    className="border-b border-border last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-text">{c.name}</td>
                    <td className="px-4 py-3">
                      <StatusChip status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-text-muted">{audience}</td>
                    <td className="px-4 py-3 text-text-muted">{date}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-text">{openRate}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-text">{clickRate}</td>
                    <td className="px-4 py-1 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === c.id ? null : c.id);
                        }}
                        className="p-1.5 rounded hover:bg-slate-100 text-text-muted"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenuId === c.id && (
                        <div
                          className="absolute right-4 top-full mt-1 z-20 bg-white border border-border rounded-md shadow-lg py-1 min-w-[140px]"
                          onMouseLeave={() => setOpenMenuId(null)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/campaigns/${c.id}`);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50"
                          >
                            View details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            Archive
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
