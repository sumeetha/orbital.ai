import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, MousePointerClick, MessageSquare,
  Sparkles, User, Plug, FileEdit, ChevronDown, ChevronRight, Bot,
} from 'lucide-react';
import { useStore } from '../store';

const copilotItems = [
  { to: '/knowledge', icon: BookOpen, label: 'Knowledge Base', journey: 'knowledge' as const },
  { to: '/integrations', icon: Plug, label: 'Integrations', journey: null },
  { to: '/annotate', icon: MousePointerClick, label: 'Annotations', journey: 'annotation' as const },
  { to: '/setup', icon: MessageSquare, label: 'Instructions', journey: 'setup' as const },
  { to: '/suggestions', icon: FileEdit, label: 'Drafts', journey: 'suggestions' as const },
];

const copilotPaths = copilotItems.map((item) => item.to);

export function Sidebar() {
  const journeyComplete = useStore((s) => s.journeyComplete);
  const location = useLocation();
  const isCopilotActive = copilotPaths.some((p) =>
    p === '/suggestions' ? location.pathname.startsWith('/suggestions') : location.pathname === p
  );
  const [copilotOpen, setCopilotOpen] = useState(isCopilotActive);

  const copilotExpanded = copilotOpen || isCopilotActive;

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

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard — top-level */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive ? 'bg-orbital-surface text-white' : 'text-orbital-text-muted hover:text-white hover:bg-orbital-surface/50'
            }`
          }
        >
          <LayoutDashboard size={18} />
          <span className="flex-1">Dashboard</span>
        </NavLink>

        {/* Copilot — collapsible section */}
        <div>
          <button
            onClick={() => setCopilotOpen(!copilotExpanded)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isCopilotActive
                ? 'text-white'
                : 'text-orbital-text-muted hover:text-white hover:bg-orbital-surface/50'
            }`}
          >
            <Bot size={18} />
            <span className="flex-1 text-left font-medium">Copilot</span>
            {copilotExpanded
              ? <ChevronDown size={14} className="text-orbital-text-muted" />
              : <ChevronRight size={14} className="text-orbital-text-muted" />}
          </button>

          {copilotExpanded && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-orbital-border pl-2">
              {copilotItems.map((item) => {
                const complete = item.journey ? journeyComplete[item.journey] : false;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive ? 'bg-orbital-surface text-white' : 'text-orbital-text-muted hover:text-white hover:bg-orbital-surface/50'
                      }`
                    }
                  >
                    <item.icon size={16} />
                    <span className="flex-1">{item.label}</span>
                    {item.journey && (
                      <span className={`w-2 h-2 rounded-full ${complete ? 'bg-orbital-success' : 'bg-orbital-border'}`} />
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
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
