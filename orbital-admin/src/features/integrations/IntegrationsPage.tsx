import { useState } from 'react';
import { Plug, Check, Loader2, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, Input, Modal } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';

type IntegrationCategory = 'crm' | 'product_analytics' | 'mcp';
type IntegrationStatus = 'not_connected' | 'configuring' | 'connected';

type Integration = {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  icon: string;
  status: IntegrationStatus;
  lastSync?: string;
};

const categoryLabels: Record<IntegrationCategory, string> = {
  crm: 'CRM',
  product_analytics: 'Product Analytics',
  mcp: 'MCP Server',
};

const categoryColors: Record<IntegrationCategory, 'blue' | 'violet' | 'amber'> = {
  crm: 'blue',
  product_analytics: 'violet',
  mcp: 'amber',
};

const initialIntegrations: Integration[] = [
  { id: 'hubspot', name: 'HubSpot', category: 'crm', description: 'Sync contact properties, deal stages, and lifecycle data', icon: '🟠', status: 'not_connected' },
  { id: 'salesforce', name: 'Salesforce', category: 'crm', description: 'Pull account and opportunity data for enterprise users', icon: '☁️', status: 'not_connected' },
  { id: 'amplitude', name: 'Amplitude', category: 'product_analytics', description: 'Import behavioral events and user cohorts', icon: '📊', status: 'not_connected' },
  { id: 'mixpanel', name: 'Mixpanel', category: 'product_analytics', description: 'Sync event data, funnels, and retention metrics', icon: '📈', status: 'not_connected' },
  { id: 'posthog', name: 'PostHog', category: 'product_analytics', description: 'Pull session recordings context, feature flags, and events', icon: '🦔', status: 'not_connected' },
  { id: 'segment', name: 'Segment', category: 'product_analytics', description: 'Use Segment as a unified event source', icon: '🟢', status: 'not_connected' },
  { id: 'custom-mcp', name: 'Custom MCP Server', category: 'mcp', description: 'Connect any tool via the Model Context Protocol', icon: '🔌', status: 'not_connected' },
];

type FilterTab = 'all' | IntegrationCategory;

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const filtered = activeTab === 'all' ? integrations : integrations.filter((i) => i.category === activeTab);
  const connected = integrations.filter((i) => i.status === 'connected');
  const connectingIntegration = integrations.find((i) => i.id === connectingId);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'mcp', label: 'MCP Servers' },
    { key: 'crm', label: 'CRM' },
    { key: 'product_analytics', label: 'Product Analytics' },
  ];

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTestSuccess(false);
    setTimeout(() => {
      setTestingConnection(false);
      setTestSuccess(true);
    }, 1500);
  };

  const handleSaveConnection = () => {
    if (!connectingId) return;
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === connectingId
          ? { ...i, status: 'connected' as const, lastSync: 'Just now' }
          : i
      )
    );
    setConnectingId(null);
    setTestSuccess(false);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: 'not_connected' as const, lastSync: undefined } : i
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle="Connect your tools so Orbital can use real context when generating guidance"
      />

      {/* Connected summary */}
      {connected.length > 0 && (
        <Card className="p-4 mb-6 border-l-4 border-l-orbital-success">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Check size={16} className="text-orbital-success" />
              <span className="font-medium">{connected.length} integration{connected.length > 1 ? 's' : ''} connected</span>
              <span className="text-orbital-text-muted">— this context is used when generating drafts</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {connected.map((i) => (
              <div key={i.id} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg text-sm">
                <span>{i.icon}</span>
                <span className="font-medium text-emerald-800">{i.name}</span>
                <span className="text-xs text-emerald-600">Synced: {i.lastSync}</span>
                <button
                  onClick={() => handleDisconnect(i.id)}
                  className="text-emerald-400 hover:text-red-500 transition-colors ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Category tabs */}
      <div className="flex items-center gap-1 mb-6 bg-slate-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-orbital-text-dark font-medium shadow-sm'
                : 'text-orbital-text-muted hover:text-orbital-text-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((integration, i) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5 h-full flex flex-col">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shrink-0">
                  {integration.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{integration.name}</h3>
                    <Badge color={categoryColors[integration.category]}>
                      {categoryLabels[integration.category]}
                    </Badge>
                  </div>
                  <p className="text-xs text-orbital-text-muted mt-1">{integration.description}</p>
                </div>
              </div>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <Badge color={integration.status === 'connected' ? 'green' : 'slate'}>
                  {integration.status === 'connected' ? 'Connected' : 'Not connected'}
                </Badge>
                {integration.status === 'connected' ? (
                  <Button variant="ghost" size="sm" onClick={() => setConnectingId(integration.id)}>
                    Configure
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => { setConnectingId(integration.id); setTestSuccess(false); }}>
                    <Plug size={14} /> Connect
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Connect Modal */}
      <Modal
        open={!!connectingId}
        onClose={() => { setConnectingId(null); setTestSuccess(false); }}
        title={connectingIntegration ? `Connect ${connectingIntegration.name}` : 'Connect Integration'}
      >
        <div className="p-6 space-y-4">
          {connectingIntegration?.category === 'mcp' ? (
            <>
              <div>
                <label className="text-xs font-medium text-orbital-text-muted">Server URL</label>
                <Input className="mt-1" placeholder="https://your-mcp-server.example.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-orbital-text-muted">Auth Token (optional)</label>
                <Input className="mt-1" type="password" placeholder="Bearer token or API key" />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-medium text-orbital-text-muted">API Key</label>
              <Input className="mt-1" type="password" placeholder="Paste your API key here" />
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleTestConnection}
              disabled={testingConnection}
            >
              {testingConnection ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </Button>

            <AnimatePresence>
              {testSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 text-sm text-orbital-success"
                >
                  <Check size={14} /> Connection successful
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-orbital-border-light">
            <Button variant="ghost" onClick={() => { setConnectingId(null); setTestSuccess(false); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveConnection} disabled={!testSuccess}>
              <Check size={14} /> Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
