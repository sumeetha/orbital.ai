import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MousePointerClick, ChevronRight, Sparkles, ArrowRight, Check, Tag, Monitor,
  Square, Link as LinkIcon, Type, LayoutGrid, Globe, Play, Puzzle, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, EditableText, Chip, Modal, Input } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { useStore } from '../../store';
import { hotspots, pageLabels, type Hotspot, type HotspotTag } from '../../mock/hotspots';

const typeIcons: Record<string, typeof Square> = { button: Square, link: LinkIcon, input: Type, section: LayoutGrid };
const tagColors: Record<string, 'emerald' | 'violet' | 'amber' | 'slate'> = {
  'Key Activation Point': 'emerald', 'Paid Feature': 'violet', 'Friction Risk': 'amber', 'Navigation': 'slate',
};
const allTags: HotspotTag[] = ['Key Activation Point', 'Paid Feature', 'Friction Risk', 'Navigation'];
const pages = ['dashboard', 'campaigns', 'wizard', 'automations', 'settings'] as const;

/* ─── Hotspot-aware wrapper ─── */
function Hs({
  id, children, captured, onCapture, justCaptured, className = '',
}: {
  id: string; children: React.ReactNode; captured: boolean; onCapture: (id: string) => void;
  justCaptured: boolean; className?: string;
}) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onCapture(id); }}
      className={`relative cursor-crosshair transition-all duration-200 rounded-lg ${
        captured
          ? 'ring-2 ring-emerald-400/70 bg-emerald-50/30'
          : 'hover:ring-2 hover:ring-violet-400/50 hover:bg-violet-50/20'
      } ${className}`}
    >
      {children}
      <AnimatePresence>
        {justCaptured && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 bg-orbital-primary text-white text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-lg"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            Captured!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Browser mock content with inline hotspots ─── */
function BrowserMockContent({
  page, capturedSet, justCapturedId, onCapture,
}: {
  page: string; capturedSet: Set<string>; justCapturedId: string | null; onCapture: (id: string) => void;
}) {
  const hs = (id: string, children: React.ReactNode, className = '') => (
    <Hs id={id} captured={capturedSet.has(id)} onCapture={onCapture} justCaptured={justCapturedId === id} className={className}>
      {children}
    </Hs>
  );

  const layouts: Record<string, React.ReactNode> = {
    dashboard: (
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {hs('hs-dash-kpi-sent',
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="text-[11px] text-slate-500">Emails Sent</div>
              <div className="text-xl font-bold text-slate-800 mt-1">12,847</div>
            </div>
          )}
          {hs('hs-dash-kpi-openrate',
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="text-[11px] text-slate-500">Open Rate</div>
              <div className="text-xl font-bold text-slate-800 mt-1">34.2%</div>
            </div>
          )}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-[11px] text-slate-500">Click Rate</div>
            <div className="text-xl font-bold text-slate-800 mt-1">5.8%</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-[11px] text-slate-500">Subscribers</div>
            <div className="text-xl font-bold text-slate-800 mt-1">2,340</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {hs('hs-dash-quickstart-create',
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 text-center">
              <div className="w-8 h-8 rounded-lg bg-blue-100 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">Create a campaign</div>
            </div>
          )}
          {hs('hs-dash-quickstart-import',
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">Import contacts</div>
            </div>
          )}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 text-center">
            <div className="w-8 h-8 rounded-lg bg-violet-100 mx-auto mb-2" />
            <div className="text-sm font-medium text-slate-700">Browse templates</div>
          </div>
        </div>
        {hs('hs-dash-recent-table',
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-sm font-medium text-slate-700 mb-3">Recent Campaigns</div>
            {['Newsletter #14', 'Product Update', 'Welcome Series'].map((c) => (
              <div key={c} className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-sm text-slate-600">{c}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Sent</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-1 mt-2">
          {hs('hs-dash-sidebar-campaigns',
            <div className="px-3 py-1.5 rounded bg-slate-200 text-xs text-slate-600">Campaigns</div>
          )}
          {hs('hs-dash-sidebar-automations',
            <div className="px-3 py-1.5 rounded bg-slate-200 text-xs text-slate-600">Automations</div>
          , 'inline-block')}
        </div>
      </div>
    ),
    wizard: (
      <div className="p-5 space-y-4">
        <div className="flex gap-2 mb-4">{['Template', 'Audience', 'Content', 'Review'].map((s, i) => (
          <div key={s} className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{s}</div>
        ))}</div>
        {hs('hs-wizard-template-gallery',
          <div className="grid grid-cols-3 gap-3">
            {['Newsletter', 'Announcement', 'Promo', 'Welcome', 'Re-engage', 'Blank'].map((t) => (
              <div key={t} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 text-center">
                <div className="w-full h-14 rounded bg-slate-100 mb-2" />
                <div className="text-xs text-slate-600">{t}</div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 space-y-3">
          {hs('hs-wizard-audience-dropdown',
            <div>
              <div className="text-xs text-slate-500 mb-1">Audience</div>
              <div className="h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center px-3 text-sm text-slate-400">Select audience...</div>
            </div>
          )}
          {hs('hs-wizard-subject-input',
            <div>
              <div className="text-xs text-slate-500 mb-1">Subject Line</div>
              <div className="h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center px-3 text-sm text-slate-400">Enter subject...</div>
            </div>
          )}
          {hs('hs-wizard-add-variant',
            <div className="inline-block text-xs text-blue-600 font-medium px-2 py-1">+ Add A/B variant</div>
          )}
        </div>
        <div className="flex justify-end">
          {hs('hs-wizard-send-btn',
            <div className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium">Send Campaign</div>
          )}
        </div>
      </div>
    ),
    automations: (
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-slate-800">Automations</div>
          {hs('hs-auto-create-btn',
            <div className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">+ Create Automation</div>
          )}
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex flex-col items-center gap-3">
          <div className="w-full max-w-xs space-y-3">
            {hs('hs-auto-trigger-node',
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center text-sm">Trigger: Contact Added</div>
            )}
            <div className="text-center text-slate-400">↓</div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center text-sm">Wait 2 hours</div>
            <div className="text-center text-slate-400">↓</div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-sm">Send Email</div>
            {hs('hs-auto-add-step',
              <div className="text-center">
                <div className="inline-block px-3 py-1.5 rounded border border-dashed border-slate-300 text-xs text-slate-500">+ Add Step</div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    campaigns: (
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-slate-800">Campaigns</div>
          {hs('hs-campaigns-create-btn',
            <div className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">+ Create Campaign</div>
          )}
        </div>
        {hs('hs-campaigns-filter-bar',
          <div className="flex gap-2">{['All', 'Draft', 'Scheduled', 'Sent'].map((f, i) => (
            <div key={f} className={`px-3 py-1 rounded-full text-xs ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{f}</div>
          ))}</div>
        )}
        {hs('hs-campaigns-list-table',
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            {['Newsletter #14', 'Product Update Q1', 'Welcome Email', 'Promo — Spring Sale'].map((c, i) => (
              <div key={c} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                <span className="text-sm text-slate-700">{c}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">{['34.2%', '28.1%', '41.0%', '22.5%'][i]} open</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${i === 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{i === 1 ? 'Scheduled' : 'Sent'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    settings: (
      <div className="p-5 space-y-4">
        <div className="text-lg font-semibold text-slate-800">Settings</div>
        <div className="flex gap-2 border-b border-slate-200 pb-2">{['Profile', 'Workspace', 'Billing', 'Team', 'Integrations'].map((t, i) => (
          <div key={t} className={`px-3 py-1.5 text-sm ${i === 2 ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-slate-500'}`}>{t}</div>
        ))}</div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-700 mb-4">Current Plan</div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
              <div className="font-semibold text-blue-700">Pro Trial</div>
              <div className="text-xs text-blue-600 mt-1">4 days remaining</div>
            </div>
            {hs('hs-settings-upgrade-btn',
              <div className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium">Upgrade</div>
            )}
          </div>
          {hs('hs-settings-billing-tab',
            <div className="text-xs text-slate-500 mt-2 px-2 py-1">Billing tab</div>
          )}
          <div className="mt-6">
            <div className="text-sm font-medium text-slate-700 mb-3">Team</div>
            {hs('hs-settings-invite-btn',
              <div className="px-4 py-2.5 rounded-lg border border-dashed border-slate-300 text-sm text-blue-600 text-center">+ Invite Teammate</div>
            )}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50/50 overflow-auto">
      {layouts[page] || layouts.dashboard}
    </div>
  );
}

/* ─── Onboarding empty state ─── */
function OnboardingState({ onStart }: { onStart: () => void }) {
  const [urlValue, setUrlValue] = useState('https://app.mailflow.io');
  const [step, setStep] = useState(0);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-orbital-primary/10 flex items-center justify-center mx-auto mb-4">
          <MousePointerClick size={32} className="text-orbital-primary" />
        </div>
        <h2 className="text-2xl font-bold text-orbital-text-dark">Annotate Your Product</h2>
        <p className="text-sm text-orbital-text-muted mt-2 max-w-md mx-auto">
          Walk through your product while the AI learns your UI structure. Follow these steps to get started.
        </p>
      </div>

      <div className="space-y-4">
        {/* Step 1: Install Extension */}
        <Card className={`p-6 transition-all ${step >= 0 ? 'border-orbital-primary/30' : ''}`}>
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step > 0 ? 'bg-orbital-success text-white' : 'bg-orbital-primary text-white'}`}>
              {step > 0 ? <Check size={20} /> : <span className="text-sm font-bold">1</span>}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Install the Orbital Browser Extension</h3>
              <p className="text-xs text-orbital-text-muted mt-1">
                The extension allows Orbital to observe your product's UI as you navigate through it. It captures element hierarchy, types, and relationships.
              </p>
              {step === 0 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-3">
                  <Button size="sm" onClick={() => setStep(1)}>
                    <Puzzle size={14} /> Install Extension
                  </Button>
                  <span className="text-xs text-orbital-text-muted">Available for Chrome and Edge</span>
                </motion.div>
              )}
              {step > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-orbital-success">
                  <Check size={12} /> Extension installed
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Step 2: Enter URL */}
        <Card className={`p-6 transition-all ${step === 1 ? 'border-orbital-primary/30' : step > 1 ? '' : 'opacity-50'}`}>
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step > 1 ? 'bg-orbital-success text-white' : step === 1 ? 'bg-orbital-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
              {step > 1 ? <Check size={20} /> : <span className="text-sm font-bold">2</span>}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Enter your product URL</h3>
              <p className="text-xs text-orbital-text-muted mt-1">
                Provide the URL of your application so Orbital can connect to it. This should be the URL your users visit.
              </p>
              {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orbital-text-muted" />
                      <Input
                        value={urlValue}
                        onChange={(e) => setUrlValue(e.target.value)}
                        className="pl-9"
                        placeholder="https://app.yourproduct.com"
                      />
                    </div>
                    <Button size="sm" onClick={() => setStep(2)} disabled={!urlValue.trim()}>
                      Connect
                    </Button>
                  </div>
                </motion.div>
              )}
              {step > 1 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-orbital-success">
                  <Check size={12} /> Connected to {urlValue}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Step 3: Start annotation */}
        <Card className={`p-6 transition-all ${step === 2 ? 'border-orbital-primary/30' : 'opacity-50'}`}>
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step === 2 ? 'bg-orbital-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
              <span className="text-sm font-bold">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Start annotating</h3>
              <p className="text-xs text-orbital-text-muted mt-1">
                Navigate through your product's key pages and click on important UI elements. The AI will observe and build a semantic map of your product in real time.
              </p>
              {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs font-medium text-orbital-text-dark mb-2">Tips for effective annotation:</div>
                    <ul className="text-xs text-orbital-text-muted space-y-1.5">
                      <li className="flex items-start gap-2"><span className="text-orbital-primary mt-px">-</span> Click buttons, links, inputs, and key sections</li>
                      <li className="flex items-start gap-2"><span className="text-orbital-primary mt-px">-</span> Visit your main pages: dashboard, creation flows, settings</li>
                      <li className="flex items-start gap-2"><span className="text-orbital-primary mt-px">-</span> Focus on activation-critical elements (CTAs, onboarding steps)</li>
                      <li className="flex items-start gap-2"><span className="text-orbital-primary mt-px">-</span> The AI will auto-detect element types and relationships</li>
                    </ul>
                  </div>
                  <Button onClick={onStart}>
                    <Play size={14} /> Start Annotation Session
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── Main annotation page ─── */
export function AnnotationPage() {
  const navigate = useNavigate();
  const { activePage, setActivePage, capturedElements, captureElement, updateElementDescription, updateElementTags, removeElement, completeAnnotation } = useStore();
  const [annotationStarted, setAnnotationStarted] = useState(false);
  const [justCaptured, setJustCaptured] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const capturedSet = new Set(capturedElements.map((e) => e.hotspot.id));
  const pageGroups = pages.map((p) => ({
    page: p,
    elements: capturedElements.filter((e) => e.hotspot.page === p),
  })).filter((g) => g.elements.length > 0);

  const handleCapture = (hotspotId: string) => {
    captureElement(hotspotId);
    setJustCaptured(hotspotId);
    setSelectedNode(hotspotId);
    setTimeout(() => setJustCaptured(null), 1500);
  };

  const handleFinish = () => {
    completeAnnotation();
    setShowComplete(true);
  };

  useEffect(() => {
    if (selectedNode) {
      document.getElementById(`tree-node-${selectedNode}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedNode]);

  // If previously annotated, go straight to annotation mode
  useEffect(() => {
    if (capturedElements.length > 0) setAnnotationStarted(true);
  }, []);

  if (!annotationStarted) {
    return (
      <div>
        <PageHeader title="Annotate Product" subtitle="Teach the AI about your product's UI structure" />
        <OnboardingState onStart={() => setAnnotationStarted(true)} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)]">
      <PageHeader
        title="Annotate Product"
        subtitle="Click elements in the product to teach the AI about your UI"
        actions={
          <Button onClick={handleFinish} disabled={capturedElements.length === 0}>
            <Check size={16} /> Finish Annotation
          </Button>
        }
      />

      <div className="flex gap-4 h-[calc(100%-5rem)]">
        {/* Left: Browser Frame */}
        <div className="flex-[3] flex flex-col min-w-0">
          {/* Extension Toolbar */}
          <div className="bg-orbital-bg text-white px-4 py-2.5 rounded-t-xl flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orbital-success animate-pulse" />
              <span className="text-xs font-medium">Annotation Mode</span>
            </div>
            <div className="h-4 w-px bg-orbital-border" />
            <span className="text-xs text-orbital-text-muted">Click elements to teach Orbital</span>
            <div className="flex-1" />
            <Badge color="blue">{capturedElements.length} elements</Badge>
          </div>

          {/* Page Tabs */}
          <div className="bg-slate-100 px-3 py-1 flex items-center gap-0.5 border-b border-slate-200">
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => setActivePage(p)}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors ${
                  activePage === p ? 'bg-white text-orbital-text-dark shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageLabels[p]}
              </button>
            ))}
            <div className="flex-1" />
            <div className="text-[11px] text-slate-400 px-2 font-mono">
              app.mailflow.io/{activePage === 'dashboard' ? '' : activePage === 'wizard' ? 'campaigns/new' : activePage}
            </div>
          </div>

          {/* Browser Content */}
          <div className="flex-1 bg-white rounded-b-xl overflow-auto border border-t-0 border-slate-200">
            <BrowserMockContent
              page={activePage}
              capturedSet={capturedSet}
              justCapturedId={justCaptured}
              onCapture={handleCapture}
            />
          </div>
        </div>

        {/* Right: Semantic Map */}
        <div className="flex-[2] flex flex-col min-w-0 overflow-hidden">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-orbital-border-light bg-slate-50 shrink-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles size={14} className="text-orbital-primary" />
                Live Semantic Map
              </div>
              {capturedElements.length > 0 && (
                <div className="text-xs text-orbital-text-muted mt-1">
                  {pageGroups.length} pages · {capturedElements.length} elements · {capturedElements.filter((e) => e.hotspot.relatedTo).length} flows detected
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {capturedElements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MousePointerClick size={32} className="text-orbital-text-muted mb-3" />
                  <p className="text-sm text-orbital-text-muted">Click elements in the product to build your map</p>
                  <p className="text-xs text-orbital-text-muted mt-1">Elements will appear here as you annotate</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pageGroups.map(({ page, elements }) => (
                    <div key={page}>
                      <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-orbital-text-muted uppercase tracking-wide">
                        <Monitor size={12} />
                        {pageLabels[page]}
                        <span className="text-orbital-text-muted font-normal">({elements.length})</span>
                      </div>
                      <AnimatePresence>
                        {elements.map((el) => {
                          const TypeIcon = typeIcons[el.hotspot.elementType] || Square;
                          const isSelected = selectedNode === el.hotspot.id;
                          return (
                            <motion.div
                              key={el.hotspot.id}
                              id={`tree-node-${el.hotspot.id}`}
                              initial={{ opacity: 0, x: -10, height: 0 }}
                              animate={{ opacity: 1, x: 0, height: 'auto' }}
                              className={`ml-4 border-l-2 pl-3 py-1.5 cursor-pointer transition-colors ${
                                isSelected ? 'border-orbital-primary bg-orbital-primary/5 rounded-r-lg' : 'border-slate-200 hover:bg-slate-50'
                              }`}
                              onClick={() => setSelectedNode(isSelected ? null : el.hotspot.id)}
                            >
                              <div className="flex items-center gap-2">
                                <TypeIcon size={12} className="text-orbital-text-muted shrink-0" />
                                <span className="text-sm font-medium truncate">{el.hotspot.elementName}</span>
                                <Badge color={el.hotspot.confidence === 'high' ? 'green' : 'amber'} className="text-[10px]">
                                  {el.hotspot.confidence}
                                </Badge>
                              </div>

                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 space-y-2"
                                  >
                                    <div className="text-xs text-orbital-text-muted">
                                      <Sparkles size={10} className="inline mr-1 text-orbital-primary" />AI Description:
                                    </div>
                                    <EditableText
                                      value={el.description}
                                      onChange={(v) => updateElementDescription(el.hotspot.id, v)}
                                      multiline
                                    />
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {el.tags.map((t) => (
                                        <Chip
                                          key={t}
                                          label={t}
                                          color={tagColors[t] || 'slate'}
                                          onRemove={() => updateElementTags(el.hotspot.id, el.tags.filter((tag) => tag !== t))}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {allTags.filter((t) => !el.tags.includes(t)).map((t) => (
                                        <button
                                          key={t}
                                          onClick={(e) => { e.stopPropagation(); updateElementTags(el.hotspot.id, [...el.tags, t]); }}
                                          className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50"
                                        >
                                          <Tag size={9} /> {t}
                                        </button>
                                      ))}
                                    </div>
                                    {el.hotspot.relatedTo && (
                                      <div className="text-xs text-orbital-info flex items-center gap-1">
                                        <ChevronRight size={10} />
                                        Leads to: {hotspots.find((h) => h.id === el.hotspot.relatedTo![0])?.elementName}
                                      </div>
                                    )}
                                    <div className="pt-2 mt-1 border-t border-slate-100">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeElement(el.hotspot.id);
                                          setSelectedNode(null);
                                        }}
                                        className="flex items-center gap-1 text-[11px] text-orbital-text-muted hover:text-orbital-danger transition-colors"
                                      >
                                        <Trash2 size={11} /> Remove annotation
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={showComplete} onClose={() => setShowComplete(false)} title="Annotation Complete!">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-orbital-success/10 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-orbital-success" />
          </div>
          <p className="text-lg font-semibold mb-2">Great work!</p>
          <p className="text-sm text-orbital-text-muted mb-6">
            I mapped {pageGroups.length} pages, {capturedElements.length} elements, and {capturedElements.filter((e) => e.hotspot.relatedTo).length} user flows.
            Ready to set up your goals?
          </p>
          <Button onClick={() => { setShowComplete(false); navigate('/setup'); }}>
            Continue to Instructions <ArrowRight size={16} />
          </Button>
        </div>
      </Modal>
    </div>
  );
}
