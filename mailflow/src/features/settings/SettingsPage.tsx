import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User as UserIcon,
  CreditCard,
  Users,
  Check,
  X,
  Upload,
  Globe,
  Lock,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../../store';
import type { AppState } from '../../store';
import type { User, Invoice } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Tabs from '../../components/Tabs';
import { ORBITAL_IDS } from '../../orbital/ids';
import { formatCurrency } from '../../lib/formatters';
import { formatDate } from '../../lib/dates';

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', orbitalId: ORBITAL_IDS.settingsTabProfile },
  { id: 'workspace', label: 'Workspace', orbitalId: ORBITAL_IDS.settingsTabWorkspace },
  { id: 'billing', label: 'Billing', orbitalId: ORBITAL_IDS.settingsTabBilling },
  { id: 'team', label: 'Team', orbitalId: ORBITAL_IDS.settingsTabTeam },
  { id: 'integrations', label: 'Integrations', orbitalId: ORBITAL_IDS.settingsTabIntegrations },
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];

const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: 0,
    features: ['500 contacts', '1,000 emails/mo', 'Basic templates', 'Email support'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 49,
    features: [
      '10,000 contacts',
      '50,000 emails/mo',
      'All templates',
      'A/B testing',
      'Automations',
      'Priority support',
    ],
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: 199,
    features: [
      'Unlimited contacts',
      'Unlimited emails',
      'Custom templates',
      'Advanced automations',
      'Dedicated IP',
      'SSO & SAML',
      'Dedicated CSM',
    ],
  },
];

const INTEGRATIONS = [
  { name: 'Slack', color: 'bg-[#4A154B]' },
  { name: 'HubSpot', color: 'bg-[#FF7A59]' },
  { name: 'Salesforce', color: 'bg-[#00A1E0]' },
  { name: 'Zapier', color: 'bg-[#FF4A00]' },
  { name: 'Shopify', color: 'bg-[#96BF48]' },
];

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const isCheckout = searchParams.get('checkout') === '1';

  const {
    currentUser,
    plan,
    teammates,
    invoices,
    setCheckoutInitiated,
    setCheckoutAbandoned,
    upgradePlan,
    inviteTeammate,
    addToast,
  } = useStore(
    useShallow((s) => ({
      currentUser: s.currentUser,
      plan: s.plan,
      teammates: s.teammates,
      invoices: s.invoices,
      setCheckoutInitiated: s.setCheckoutInitiated,
      setCheckoutAbandoned: s.setCheckoutAbandoned,
      upgradePlan: s.upgradePlan,
      inviteTeammate: s.inviteTeammate,
      addToast: s.addToast,
    })),
  );

  const handleTabChange = (tab: string) => {
    if (isCheckout && tab !== 'billing') {
      setCheckoutAbandoned(true);
    }
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (isCheckout) {
      setCheckoutInitiated(true);
    }
  }, [isCheckout, setCheckoutInitiated]);

  useEffect(() => {
    const handleBeforeNavigate = () => {
      if (isCheckout) {
        setCheckoutAbandoned(true);
      }
    };
    window.addEventListener('beforeunload', handleBeforeNavigate);
    return () => window.removeEventListener('beforeunload', handleBeforeNavigate);
  }, [isCheckout, setCheckoutAbandoned]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-xl font-semibold text-text">Settings</h1>

      <Tabs tabs={SETTINGS_TABS} activeTab={activeTab} onChange={handleTabChange} />

      <div className="mt-6">
        {activeTab === 'profile' && <ProfileTab user={currentUser} addToast={addToast} />}
        {activeTab === 'workspace' && <WorkspaceTab addToast={addToast} />}
        {activeTab === 'billing' && (
          <BillingTab
            plan={plan}
            invoices={invoices}
            isCheckout={isCheckout}
            onUpgradeClick={() => {
              setSearchParams({ tab: 'billing', checkout: '1' });
            }}
            onCompleteCheckout={() => {
              upgradePlan('pro');
              setSearchParams({ tab: 'billing' });
              addToast('Upgraded to Pro! Welcome aboard.', 'success');
            }}
            onCloseCheckout={() => {
              setCheckoutAbandoned(true);
              setSearchParams({ tab: 'billing' });
            }}
          />
        )}
        {activeTab === 'team' && (
          <TeamTab
            teammates={teammates}
            currentUser={currentUser}
            onInvite={(email, role) => {
              inviteTeammate(email, role);
              addToast(`Invitation sent to ${email}`, 'success');
            }}
          />
        )}
        {activeTab === 'integrations' && <IntegrationsTab />}
      </div>
    </div>
  );
}

/* ─── Profile Tab ───────────────────────────────────────────────────── */

function ProfileTab({
  user,
  addToast,
}: {
  user: User;
  addToast: AppState['addToast'];
}) {
  const [name, setName] = useState(user.name);

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          <UserIcon size={32} />
        </div>
        <div>
          <p className="text-sm font-medium text-text">Profile photo</p>
          <p className="text-xs text-text-muted mt-0.5">JPG or PNG, max 2 MB</p>
          <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors">
            <Upload size={12} /> Upload
          </button>
        </div>
      </div>

      <Input
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        label="Email"
        value={user.email}
        readOnly
        className="bg-slate-50 text-text-muted cursor-not-allowed"
      />

      <Button
        onClick={() => addToast('Profile saved', 'success')}
        size="sm"
      >
        Save changes
      </Button>
    </div>
  );
}

/* ─── Workspace Tab ─────────────────────────────────────────────────── */

function WorkspaceTab({ addToast }: { addToast: AppState['addToast'] }) {
  const [workspaceName, setWorkspaceName] = useState('MailFlow Demo');
  const [timezone, setTimezone] = useState('America/New_York');

  return (
    <div className="max-w-lg space-y-6">
      <Input
        label="Workspace name"
        value={workspaceName}
        onChange={(e) => setWorkspaceName(e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">Sending domain</label>
        <div className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md bg-slate-50 text-text-muted">
          <Lock size={14} className="shrink-0" />
          hello@mailflow.demo
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">Timezone</label>
        <div className="relative">
          <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-white
              focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={() => addToast('Workspace settings saved', 'success')}
        size="sm"
      >
        Save changes
      </Button>
    </div>
  );
}

/* ─── Billing Tab ───────────────────────────────────────────────────── */

function BillingTab({
  plan,
  invoices,
  isCheckout,
  onUpgradeClick,
  onCompleteCheckout,
  onCloseCheckout,
}: {
  plan: string;
  invoices: Invoice[];
  isCheckout: boolean;
  onUpgradeClick: () => void;
  onCompleteCheckout: () => void;
  onCloseCheckout: () => void;
}) {
  /** Single tour anchor: Pro upgrade from Free, or Enterprise when already on Pro */
  const tourUpgradePlanId = plan === 'free' ? 'pro' : plan === 'pro' ? 'enterprise' : undefined;

  return (
    <div className="space-y-8 relative">
      {/* Plan cards */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-4">Your plan</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((p) => {
            const isCurrent = plan === p.id;
            return (
              <Card
                key={p.id}
                className={`p-5 flex flex-col ${isCurrent ? 'ring-2 ring-primary border-primary' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-text">{p.name}</h4>
                  {isCurrent && (
                    <Badge variant="blue">Current</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-text mb-4">
                  {p.price === 0 ? 'Free' : `${formatCurrency(p.price)}`}
                  {p.price > 0 && <span className="text-sm font-normal text-text-muted">/mo</span>}
                </p>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                      <Check size={14} className="mt-0.5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="secondary" size="sm" disabled className="w-full">
                    Current plan
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    data-orbital-id={
                      !isCheckout && tourUpgradePlanId !== undefined && p.id === tourUpgradePlanId
                        ? ORBITAL_IDS.settingsUpgradeBtn
                        : undefined
                    }
                    onClick={() => onUpgradeClick()}
                  >
                    Upgrade
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment method */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">Payment method</h3>
        <Card className="p-4 inline-flex items-center gap-4">
          <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white text-[10px] font-bold tracking-wider">
            VISA
          </div>
          <div>
            <p className="text-sm font-medium text-text">Visa ending in 4242</p>
            <p className="text-xs text-text-muted">Expires 12/28</p>
          </div>
        </Card>
      </div>

      {/* Invoices */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">Invoices</h3>
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/60">
                <th className="text-left font-medium text-text-muted px-4 py-3">Date</th>
                <th className="text-left font-medium text-text-muted px-4 py-3">Description</th>
                <th className="text-right font-medium text-text-muted px-4 py-3">Amount</th>
                <th className="text-right font-medium text-text-muted px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text-muted">{formatDate(inv.date)}</td>
                  <td className="px-4 py-3 text-text">{inv.description}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-text">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={inv.status === 'paid' ? 'emerald' : 'amber'}>
                      {inv.status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout overlay */}
      {isCheckout && (
        <CheckoutOverlay
          onComplete={onCompleteCheckout}
          onClose={onCloseCheckout}
        />
      )}
    </div>
  );
}

function CheckoutOverlay({
  onComplete,
  onClose,
}: {
  onComplete: () => void;
  onClose: () => void;
}) {
  const proPlan = PLANS.find((p) => p.id === 'pro')!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <CreditCard size={16} className="text-white" />
            </div>
            <span className="font-semibold text-text">MailFlow Checkout</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-text mb-3">Order summary</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text">{proPlan.name} Plan</span>
              <span className="font-medium text-text">{formatCurrency(proPlan.price)}/mo</span>
            </div>
            <div className="border-t border-slate-200 mt-3 pt-3 flex items-center justify-between text-sm">
              <span className="font-medium text-text">Total</span>
              <span className="text-lg font-bold text-text">{formatCurrency(proPlan.price)}</span>
            </div>
          </div>

          {/* Card fields */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">Card number</label>
              <div className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md bg-white">
                <CreditCard size={16} className="text-slate-400 shrink-0" />
                <span className="text-text tabular-nums">4242 4242 4242 4242</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text">Expiry</label>
                <div className="px-3 py-2 text-sm border border-border rounded-md bg-white text-text">
                  12/28
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text">CVC</label>
                <div className="px-3 py-2 text-sm border border-border rounded-md bg-white text-text">
                  •••
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={onComplete}
            className="w-full"
            size="lg"
            data-orbital-id={ORBITAL_IDS.settingsUpgradeBtn}
          >
            Complete upgrade
          </Button>

          <p className="text-center text-xs text-text-muted">
            This is a demo. No real charges will be made.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Team Tab ──────────────────────────────────────────────────────── */

function TeamTab({
  teammates,
  currentUser,
  onInvite,
}: {
  teammates: User[];
  currentUser: User;
  onInvite: (email: string, role: 'admin' | 'editor' | 'viewer') => void;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    onInvite(inviteEmail.trim(), inviteRole);
    setInviteEmail('');
    setInviteRole('editor');
    setShowInvite(false);
  };

  const allMembers = [currentUser, ...teammates];

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'blue' as const;
      case 'admin':
        return 'emerald' as const;
      case 'editor':
        return 'amber' as const;
      default:
        return 'slate' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text">Team members</h3>
          <p className="text-xs text-text-muted mt-0.5">{allMembers.length} member{allMembers.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowInvite(true)}
          data-orbital-id={ORBITAL_IDS.settingsInviteTeammateBtn}
        >
          <Users size={14} />
          Invite teammate
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/60">
              <th className="text-left font-medium text-text-muted px-4 py-3">Name</th>
              <th className="text-left font-medium text-text-muted px-4 py-3">Email</th>
              <th className="text-left font-medium text-text-muted px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {allMembers.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-text">
                  {m.name}
                  {m.id === currentUser.id && (
                    <span className="ml-2 text-xs text-text-muted">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">{m.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={roleBadgeVariant(m.role)}>
                    {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite teammate">
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'editor' | 'viewer')}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white
                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
              Send invite
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Integrations Tab ──────────────────────────────────────────────── */

function IntegrationsTab() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text">Integrations</h3>
        <p className="text-xs text-text-muted mt-0.5">Connect MailFlow with your favorite tools</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((integration) => (
          <Card key={integration.name} className="p-5 flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-lg ${integration.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
            >
              {integration.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text">{integration.name}</h4>
              <p className="text-xs text-text-muted mt-0.5">Not connected</p>
            </div>
            <Button variant="secondary" size="sm">
              Connect
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
