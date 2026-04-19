import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowRight, Layout } from 'lucide-react';
import { useStore } from '../../store';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { ORBITAL_IDS } from '../../orbital/ids';
import type { Template } from '../../types';

type Category = Template['category'] | 'all';

const CATEGORIES: { id: Category; label: string; orbitalId?: string }[] = [
  { id: 'all', label: 'All Templates' },
  { id: 'newsletter', label: 'Newsletter', orbitalId: ORBITAL_IDS.templatesCategoryNewsletter },
  { id: 'announcement', label: 'Announcement', orbitalId: ORBITAL_IDS.templatesCategoryAnnouncement },
  { id: 'promo', label: 'Promo', orbitalId: ORBITAL_IDS.templatesCategoryPromo },
  { id: 'transactional', label: 'Transactional', orbitalId: ORBITAL_IDS.templatesCategoryTransactional },
  { id: 'blank', label: 'Blank' },
];

const CATEGORY_COLORS: Record<string, { bg: string; accent: string }> = {
  newsletter: { bg: 'bg-blue-50', accent: 'bg-blue-500' },
  announcement: { bg: 'bg-violet-50', accent: 'bg-violet-500' },
  promo: { bg: 'bg-amber-50', accent: 'bg-amber-500' },
  transactional: { bg: 'bg-emerald-50', accent: 'bg-emerald-500' },
  blank: { bg: 'bg-slate-50', accent: 'bg-slate-400' },
};

const CATEGORY_BADGE_VARIANT: Record<string, 'blue' | 'amber' | 'emerald' | 'slate'> = {
  newsletter: 'blue',
  announcement: 'slate',
  promo: 'amber',
  transactional: 'emerald',
  blank: 'slate',
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const templates = useStore((s) => s.templates);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return templates;
    return templates.filter((t) => t.category === activeCategory);
  }, [templates, activeCategory]);

  if (templates.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<Layout size={28} />}
          title="No templates available"
          description="Templates will appear here once they are added to the system."
        />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Category sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-slate-50/60 p-4 space-y-1">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
          Categories
        </p>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            data-orbital-id={cat.orbitalId}
            onClick={() => setActiveCategory(cat.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${activeCategory === cat.id
                ? 'bg-primary text-white'
                : 'text-text-muted hover:bg-slate-100 hover:text-text'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </aside>

      {/* Gallery grid */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">Templates</h1>
          <p className="text-sm text-text-muted mt-1">
            Choose a template to start your next campaign
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tpl) => {
            const colors = CATEGORY_COLORS[tpl.category] ?? CATEGORY_COLORS.blank;
            return (
              <Card key={tpl.id} className="group overflow-hidden">
                {/* Colored preview area */}
                <div className={`relative h-44 ${colors.bg} flex items-center justify-center`}>
                  <div className={`w-20 h-1 rounded-full ${colors.accent} opacity-30`} />
                  <div className={`absolute top-3 left-3 w-16 h-2 rounded ${colors.accent} opacity-20`} />
                  <div className={`absolute top-7 left-3 w-24 h-2 rounded ${colors.accent} opacity-15`} />
                  <div className={`absolute bottom-3 right-3 w-10 h-6 rounded ${colors.accent} opacity-20`} />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewTemplate(tpl)}
                    >
                      <Eye size={14} />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      data-orbital-id={`templates-use-btn-${tpl.id}`}
                      onClick={() => navigate(`/campaigns/new?step=2&templateId=${tpl.id}`)}
                    >
                      <ArrowRight size={14} />
                      Use template
                    </Button>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-text truncate">{tpl.name}</span>
                  <Badge variant={CATEGORY_BADGE_VARIANT[tpl.category] ?? 'slate'}>
                    {tpl.category.charAt(0).toUpperCase() + tpl.category.slice(1)}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Preview modal */}
      <Modal
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate?.name ?? 'Template Preview'}
        wide
      >
        {previewTemplate?.previewHtml ? (
          <div
            className="border border-border rounded-md overflow-auto max-h-[60vh]"
            dangerouslySetInnerHTML={{ __html: previewTemplate.previewHtml }}
          />
        ) : (
          <p className="text-sm text-text-muted py-8 text-center">No preview available.</p>
        )}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
          <Button variant="secondary" onClick={() => setPreviewTemplate(null)}>
            Close
          </Button>
          <Button
            data-orbital-id={previewTemplate ? `templates-use-btn-${previewTemplate.id}` : undefined}
            onClick={() => {
              if (previewTemplate) {
                navigate(`/campaigns/new?step=2&templateId=${previewTemplate.id}`);
              }
            }}
          >
            Use template
          </Button>
        </div>
      </Modal>
    </div>
  );
}
