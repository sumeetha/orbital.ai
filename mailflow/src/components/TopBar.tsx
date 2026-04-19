import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User } from 'lucide-react';
import { useStore } from '../store';
import { ORBITAL_IDS } from '../orbital/ids';
import { formatRelative } from '../lib/dates';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/campaigns': 'Campaigns',
  '/campaigns/new': 'Create Campaign',
  '/templates': 'Templates',
  '/audiences': 'Audiences',
  '/automations': 'Automations',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const user = useStore((s) => s.currentUser);
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationRead);
  const campaigns = useStore((s) => s.campaigns);
  const templates = useStore((s) => s.templates);
  const contacts = useStore((s) => s.contacts);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const title =
    routeTitles[location.pathname] ||
    (location.pathname.startsWith('/campaigns/') ? 'Campaign' : location.pathname.split('/').pop() || '');

  const searchResults = searchQuery.trim()
    ? [
        ...campaigns
          .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3)
          .map((c) => ({ label: c.name, type: 'Campaign', to: `/campaigns/${c.id}` })),
        ...templates
          .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3)
          .map((t) => ({ label: t.name, type: 'Template', to: `/templates` })),
        ...contacts
          .filter(
            (c) =>
              c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 3)
          .map((c) => ({ label: `${c.firstName} ${c.lastName}`, type: 'Contact', to: `/audiences` })),
      ]
    : [];

  return (
    <header
      className={`fixed top-12 right-0 h-16 bg-white border-b border-border flex items-center justify-between px-6 z-20 transition-all duration-200
        ${collapsed ? 'left-16' : 'left-60'}`}
    >
      <h1 className="text-lg font-semibold text-text">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative" data-orbital-id={ORBITAL_IDS.topbarSearch}>
          {searchOpen ? (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80">
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  setTimeout(() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }, 200);
                }}
                placeholder="Search campaigns, templates, contacts..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-border rounded-lg shadow-lg overflow-hidden">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
                      onMouseDown={() => navigate(r.to)}
                    >
                      <span className="text-text">{r.label}</span>
                      <span className="text-xs text-text-muted">{r.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-md text-text-muted hover:bg-slate-100 transition-colors"
            >
              <Search size={20} />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef} data-orbital-id={ORBITAL_IDS.topbarNotifications}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-md text-text-muted hover:bg-slate-100 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">Notifications</h3>
              </div>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-slate-50 border-b border-border last:border-0
                    ${!n.read ? 'bg-blue-50/50' : ''}`}
                >
                  <p className="text-text">{n.message}</p>
                  <p className="text-xs text-text-muted mt-1">{formatRelative(n.createdAt)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef} data-orbital-id={ORBITAL_IDS.topbarUserMenu}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <ChevronDown size={14} className="text-text-muted" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-text">{user.name}</p>
                <p className="text-xs text-text-muted">{user.email}</p>
              </div>
              <button
                onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 text-text"
              >
                Profile
              </button>
              <button
                onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 text-text"
              >
                Settings
              </button>
              <button className="w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 text-text-muted border-t border-border">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
