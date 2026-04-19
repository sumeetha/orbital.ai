import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, MousePointerClick, MessageSquare, Sparkles, User } from 'lucide-react';
import { useStore } from '../store';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', journey: null },
  { to: '/knowledge', icon: BookOpen, label: 'Knowledge Base', journey: 'knowledge' as const },
  { to: '/annotate', icon: MousePointerClick, label: 'Annotate Product', journey: 'annotation' as const },
  { to: '/setup', icon: MessageSquare, label: 'Agent Setup', journey: 'setup' as const },
  { to: '/suggestions', icon: Sparkles, label: 'Suggestions', journey: 'suggestions' as const },
];

export function Sidebar() {
  const journeyComplete = useStore((s) => s.journeyComplete);

  return (
    <aside className="w-60 bg-orbital-bg text-orbital-text flex flex-col shrink-0 h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-orbital-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orbital-primary flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Orbital AI</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const complete = item.journey ? journeyComplete[item.journey] : false;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-orbital-surface text-white' : 'text-orbital-text-muted hover:text-white hover:bg-orbital-surface/50'
                }`
              }
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.journey && (
                <span className={`w-2 h-2 rounded-full ${complete ? 'bg-orbital-success' : 'bg-orbital-border'}`} />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-orbital-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orbital-primary/30 flex items-center justify-center">
            <User size={16} className="text-orbital-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">Sarah Kim</div>
            <div className="text-xs text-orbital-text-muted truncate">Growth PM · MailFlow</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
