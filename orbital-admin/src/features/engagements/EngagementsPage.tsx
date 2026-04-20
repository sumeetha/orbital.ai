import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Map, BellRing, ClipboardList, Pause, Play, Trash2, ArrowUpRight,
  Crosshair, ListChecks, Flag, MessageCircle, SquareStack,
  ThumbsUp, Star, FileText, BarChart3, Megaphone,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, Badge, Button } from '../../components/ui';
import { useStore } from '../../store';
import type { EngagementType, EngagementSubType } from '../../mock/engagements';

const typeConfig: Record<EngagementType, { icon: typeof Map; label: string; pluralLabel: string; color: 'blue' | 'amber' | 'violet' }> = {
  tour: { icon: Map, label: 'Tour', pluralLabel: 'Tours', color: 'blue' },
  nudge: { icon: BellRing, label: 'Nudge', pluralLabel: 'Nudges', color: 'amber' },
  feedback: { icon: ClipboardList, label: 'Feedback', pluralLabel: 'Feedback', color: 'violet' },
};

const subTypeConfig: Record<string, { icon: typeof Map; label: string; color: string }> = {
  'spotlight': { icon: Crosshair, label: 'Spotlight', color: 'bg-amber-50 text-amber-700' },
  'checklist': { icon: ListChecks, label: 'Checklist', color: 'bg-orange-50 text-orange-700' },
  'banner': { icon: Flag, label: 'Banner', color: 'bg-yellow-50 text-yellow-700' },
  'popup': { icon: MessageCircle, label: 'Popup', color: 'bg-rose-50 text-rose-700' },
  'modal': { icon: SquareStack, label: 'Modal', color: 'bg-red-50 text-red-700' },
  'micro-survey': { icon: Megaphone, label: 'Micro Survey', color: 'bg-violet-50 text-violet-700' },
  'nps': { icon: BarChart3, label: 'NPS', color: 'bg-purple-50 text-purple-700' },
  'like-dislike': { icon: ThumbsUp, label: 'Like / Dislike', color: 'bg-fuchsia-50 text-fuchsia-700' },
  'star-rating': { icon: Star, label: 'Star Rating', color: 'bg-pink-50 text-pink-700' },
  'large-survey': { icon: FileText, label: 'Large Survey', color: 'bg-indigo-50 text-indigo-700' },
};

const statusColors = {
  active: 'green' as const,
  paused: 'amber' as const,
  draft: 'slate' as const,
};

function SubTypeBadge({ subType }: { subType?: EngagementSubType }) {
  if (!subType) return null;
  const cfg = subTypeConfig[subType];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

export function EngagementsPage({ filterType }: { filterType?: EngagementType }) {
  const { engagements, pauseEngagement, resumeEngagement, archiveEngagement } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFilter = filterType || (searchParams.get('type') as EngagementType | null);

  const filtered = tabFilter ? engagements.filter((e) => e.type === tabFilter) : engagements;

  const counts = {
    tour: engagements.filter((e) => e.type === 'tour').length,
    nudge: engagements.filter((e) => e.type === 'nudge').length,
    feedback: engagements.filter((e) => e.type === 'feedback').length,
  };
  const activeCount = engagements.filter((e) => e.status === 'active').length;

  const title = filterType
    ? typeConfig[filterType].pluralLabel
    : 'Engagements';
  const subtitle = filterType
    ? `All ${typeConfig[filterType].label.toLowerCase()} engagements`
    : 'All active tours, nudges, and feedback';

  const openCreateFlow = () => {
    const targetType = tabFilter ? `?type=${tabFilter}` : '';
    navigate(`/engagements/new${targetType}`);
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={(
          <Button size="sm" onClick={openCreateFlow}>
            <Plus size={14} /> Create Engagement
          </Button>
        )}
      />

      {!filterType && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-2xl font-bold text-orbital-text-dark">{engagements.length}</div>
            <div className="text-sm text-orbital-text-muted mt-1">Total Engagements</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
            <div className="text-sm text-orbital-text-muted mt-1">Active</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-orbital-text-dark">{counts.tour}</div>
              <Badge color="blue">Tours</Badge>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-lg font-semibold text-orbital-text-dark">{counts.nudge}</div>
              <Badge color="amber">Nudges</Badge>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-orbital-text-dark">{counts.feedback}</div>
              <Badge color="violet">Feedback</Badge>
            </div>
            <div className="text-sm text-orbital-text-muted mt-2">Feedback collection</div>
          </Card>
        </div>
      )}

      {!filterType && (
        <div className="flex gap-2 mb-4">
          {([null, 'tour', 'nudge', 'feedback'] as const).map((t) => (
            <button
              key={t ?? 'all'}
              onClick={() => {
                if (t) searchParams.set('type', t);
                else searchParams.delete('type');
                setSearchParams(searchParams);
              }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                tabFilter === t || (!tabFilter && t === null)
                  ? 'bg-orbital-primary text-white'
                  : 'bg-white text-orbital-text-muted border border-orbital-border-light hover:bg-slate-50'
              }`}
            >
              {t ? typeConfig[t].pluralLabel : 'All'}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-orbital-text-muted mb-4">No engagements found</div>
          <Link to="/suggestions">
            <Button variant="primary" size="sm">
              Go to Drafts <ArrowUpRight size={14} />
            </Button>
          </Link>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-orbital-border-light text-left text-orbital-text-muted">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Kind</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Segment</th>
                  <th className="px-4 py-3 font-medium">Last Triggered</th>
                  <th className="px-4 py-3 font-medium text-right">Conversion</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((eng) => {
                  const tc = typeConfig[eng.type];
                  const TypeIcon = tc.icon;
                  return (
                    <tr key={eng.id} className="border-b border-orbital-border-light last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-orbital-text-dark">{eng.name}</td>
                      <td className="px-4 py-3">
                        <Badge color={tc.color}>
                          <span className="flex items-center gap-1"><TypeIcon size={12} /> {tc.label}</span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <SubTypeBadge subType={eng.subType} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={statusColors[eng.status]}>
                          {eng.status.charAt(0).toUpperCase() + eng.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-orbital-text-muted">{eng.segment}</td>
                      <td className="px-4 py-3 text-orbital-text-muted">{eng.lastTriggered}</td>
                      <td className="px-4 py-3 text-right font-medium text-orbital-text-dark">{eng.conversionRate}%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {eng.status === 'active' ? (
                            <button
                              onClick={() => pauseEngagement(eng.id)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-orbital-text-muted hover:text-amber-600 transition-colors"
                              title="Pause"
                            >
                              <Pause size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => resumeEngagement(eng.id)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-orbital-text-muted hover:text-emerald-600 transition-colors"
                              title="Resume"
                            >
                              <Play size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => archiveEngagement(eng.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-orbital-text-muted hover:text-red-500 transition-colors"
                            title="Archive"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
