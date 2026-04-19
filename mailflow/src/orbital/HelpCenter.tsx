import { BookOpen, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';

const articles = [
  {
    id: 1,
    category: 'Getting started',
    title: 'How to send your first campaign',
    readTime: '3 min read',
  },
  {
    id: 2,
    category: 'Getting started',
    title: 'Importing your contact list',
    readTime: '2 min read',
  },
  {
    id: 3,
    category: 'Campaigns',
    title: 'Understanding open rates and click rates',
    readTime: '4 min read',
  },
  {
    id: 4,
    category: 'Campaigns',
    title: 'A/B testing your subject lines',
    readTime: '5 min read',
  },
  {
    id: 5,
    category: 'Automations',
    title: 'Setting up a welcome series',
    readTime: '6 min read',
  },
  {
    id: 6,
    category: 'Automations',
    title: 'Re-engage inactive subscribers automatically',
    readTime: '4 min read',
  },
  {
    id: 7,
    category: 'Analytics',
    title: 'Reading your campaign performance report',
    readTime: '3 min read',
  },
  {
    id: 8,
    category: 'Billing',
    title: "What's included in the Pro plan?",
    readTime: '2 min read',
  },
];

export default function HelpCenter() {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )
    : articles;

  const grouped = filtered.reduce<Record<string, typeof articles>>(
    (acc, a) => {
      if (!acc[a.category]) acc[a.category] = [];
      acc[a.category].push(a);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 px-1">
              {category}
            </p>
            <div className="space-y-0.5">
              {items.map((a) => (
                <button
                  key={a.id}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={14} className="text-text-muted shrink-0" />
                    <div>
                      <p className="text-sm text-text group-hover:text-primary transition-colors leading-tight">
                        {a.title}
                      </p>
                      <p className="text-xs text-text-muted">{a.readTime}</p>
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            <BookOpen size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No articles found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
