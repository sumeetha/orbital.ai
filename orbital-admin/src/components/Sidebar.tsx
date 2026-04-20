import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, MousePointerClick, MessageSquare,
  User, Plug, FileEdit, ChevronDown, ChevronRight, Bot,
  Zap, Map, BellRing, ClipboardList, BarChart3, Palette, Settings,
  Users, CreditCard,
} from 'lucide-react';
import { useStore } from '../store';

function OrbitalLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="5" fill="white" />
      <ellipse cx="24" cy="24" rx="20" ry="8" stroke="white" strokeWidth="2.5" fill="none" transform="rotate(-30 24 24)" />
      <ellipse cx="24" cy="24" rx="20" ry="8" stroke="white" strokeWidth="2.5" fill="none" transform="rotate(30 24 24)" opacity="0.6" />
      <circle cx="40" cy="16.5" r="3" fill="white" />
    </svg>
  );
}

const argusItems = [
  { to: '/knowledge', icon: BookOpen, label: 'Knowledge Base', journey: 'knowledge' as const },
  { to: '/integrations', icon: Plug, label: 'Integrations', journey: null },
  { to: '/annotate', icon: MousePointerClick, label: 'Annotations', journey: 'annotation' as const },
  { to: '/setup', icon: MessageSquare, label: 'Instructions', journey: 'setup' as const },
  { to: '/suggestions', icon: FileEdit, label: 'Drafts', journey: 'suggestions' as const },
];

const engagementItems = [
  { to: '/engagements', icon: Zap, label: 'All Engagements', end: true },
  { to: '/engagements/tours', icon: Map, label: 'Tours' },
  { to: '/engagements/nudges', icon: BellRing, label: 'Nudges' },
  { to: '/engagements/feedback', icon: ClipboardList, label: 'Feedback' },
];

const settingsItems = [
  { to: '/settings/team', icon: Users, label: 'Team' },
  { to: '/settings/billing', icon: CreditCard, label: 'Billing' },
];

const argusPaths = argusItems.map((item) => item.to);
const engagementPaths = engagementItems.map((item) => item.to);
const settingsPaths = settingsItems.map((item) => item.to);

function CollapsibleSection({
  icon: Icon,
  label,
  isActive,
  items,
  journeyComplete,
}: {
  icon: typeof Bot;
  label: string;
  isActive: boolean;
  items: { to: string; icon: typeof BookOpen; label: string; journey?: string | null; end?: boolean }[];
  journeyComplete?: Record<string, boolean>;
}) {
  const [manualOpen, setManualOpen] = useState(isActive);
  const expanded = manualOpen || isActive;

  return (
    <div>
      <button
        onClick={() => setManualOpen(!expanded)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          isActive
            ? 'text-white'
            : 'text-orbital-text-muted hover:text-white hover:bg-orbital-surface/50'
        }`}
      >
        <Icon size={18} />
        <span className="flex-1 text-left font-medium">{label}</span>
        {expanded
          ? <ChevronDown size={14} className="text-orbital-text-muted" />
          : <ChevronRight size={14} className="text-orbital-text-muted" />}
      </button>

      {expanded && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-orbital-border pl-2">
          {items.map((item) => {
            const complete = journeyComplete && item.journey ? journeyComplete[item.journey] : false;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive: active }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active ? 'bg-orbital-surface text-white' : 'text-orbital-text-muted hover:text-white hover:bg-orbital-surface/50'
                  }`
                }
              >
                <item.icon size={16} />
                <span className="flex-1">{item.label}</span>
                {journeyComplete && item.journey && (
                  <span className={`w-2 h-2 rounded-full ${complete ? 'bg-orbital-success' : 'bg-orbital-border'}`} />
                )}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const journeyComplete = useStore((s) => s.journeyComplete);
  const location = useLocation();

  const isArgusActive = argusPaths.some((p) =>
    p === '/suggestions' ? location.pathname.startsWith('/suggestions') : location.pathname === p
  );
  const isEngagementsActive = engagementPaths.some((p) =>
    p === '/engagements' ? location.pathname.startsWith('/engagements') : location.pathname === p
  );
  const isSettingsActive = settingsPaths.some((p) => location.pathname === p) || location.pathname === '/settings';

  return (
    <aside className="w-60 bg-orbital-bg text-orbital-text flex flex-col shrink-0 h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-orbital-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orbital-primary flex items-center justify-center">
            <OrbitalLogo size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">Orbital AI</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard */}
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

        {/* Argus Copilot */}
        <CollapsibleSection
          icon={Bot}
          label="Argus Copilot"
          isActive={isArgusActive}
          items={argusItems}
          journeyComplete={journeyComplete}
        />

        {/* Engagements */}
        <CollapsibleSection
          icon={Zap}
          label="Engagements"
          isActive={isEngagementsActive}
          items={engagementItems}
        />

        {/* Insights */}
        <NavLink
          to="/insights"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive ? 'bg-orbital-surface text-white' : 'text-orbital-text-muted hover:text-white hover:bg-orbital-surface/50'
            }`
          }
        >
          <BarChart3 size={18} />
          <span className="flex-1">Insights</span>
        </NavLink>

        {/* Branding */}
        <NavLink
          to="/branding"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive ? 'bg-orbital-surface text-white' : 'text-orbital-text-muted hover:text-white hover:bg-orbital-surface/50'
            }`
          }
        >
          <Palette size={18} />
          <span className="flex-1">Branding</span>
        </NavLink>

        {/* Settings */}
        <CollapsibleSection
          icon={Settings}
          label="Settings"
          isActive={isSettingsActive}
          items={settingsItems}
        />
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
