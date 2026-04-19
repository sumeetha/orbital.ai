import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Send,
  FileText,
  Users,
  Zap,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../store';
import { ORBITAL_IDS } from '../orbital/ids';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, orbitalId: ORBITAL_IDS.sidebarDashboard },
  { to: '/campaigns', label: 'Campaigns', icon: Send, orbitalId: ORBITAL_IDS.sidebarCampaigns },
  { to: '/templates', label: 'Templates', icon: FileText, orbitalId: ORBITAL_IDS.sidebarTemplates },
  { to: '/audiences', label: 'Audiences', icon: Users, orbitalId: ORBITAL_IDS.sidebarAudiences },
  { to: '/automations', label: 'Automations', icon: Zap, orbitalId: ORBITAL_IDS.sidebarAutomations },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, orbitalId: ORBITAL_IDS.sidebarAnalytics },
  { to: '/settings', label: 'Settings', icon: Settings, orbitalId: ORBITAL_IDS.sidebarSettings },
];

export default function Sidebar() {
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const toggle = useStore((s) => s.toggleSidebar);
  const plan = useStore((s) => s.plan);
  const trialDaysLeft = useStore((s) => s.trialDaysLeft);

  return (
    <aside
      className={`fixed top-12 left-0 bottom-0 bg-white border-r border-border flex flex-col z-30 transition-all duration-200
        ${collapsed ? 'w-16' : 'w-60'}`}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Send size={16} className="text-white" />
        </div>
        {!collapsed && <span className="font-bold text-lg text-text">MailFlow</span>}
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            data-orbital-id={item.orbitalId}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${isActive ? 'bg-blue-50 text-primary' : 'text-text-muted hover:bg-slate-50 hover:text-text'}`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <>
          {plan === 'free' && (
            <div
              className="mx-3 mb-1 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
              data-orbital-id={ORBITAL_IDS.sidebarUpgradeCard}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-text-muted">Unlock A/B testing, automations, and more.</p>
            </div>
          )}
          {plan === 'pro' && trialDaysLeft !== undefined && (
            <div className="mx-3 mb-1 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">Pro Trial</span>
              </div>
              <p className="text-xs text-amber-700 font-medium">{trialDaysLeft} days remaining</p>
            </div>
          )}
        </>
      )}

      <button
        onClick={toggle}
        className="flex items-center justify-center h-10 border-t border-border text-text-muted hover:text-text hover:bg-slate-50 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
