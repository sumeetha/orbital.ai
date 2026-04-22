import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { X, MessageSquare, BookOpen, Rocket, Send, ChevronRight } from 'lucide-react';
import HelpCenter from './HelpCenter';
import Launchpad from './Launchpad';
import { useTour } from './TourContext';
import type { TourId } from './TourEngine';
import { buildTourFromQuestion } from './dynamicTour';
import { useStore } from '../store';
import type { OrbitalChatLine } from '../store';

type Tab = 'chat' | 'help' | 'launchpad';

type ChatMessage = OrbitalChatLine | { id: string; role: 'user'; text: string };

const initialMessages: ChatMessage[] = [
  {
    id: 'intro',
    role: 'orbital',
    text: "Hi! I'm Orbital — your in-product guide. I can walk you through features, answer questions, or launch a guided tour. What would you like help with?",
  },
];

const cannedResponses: Record<string, string> = {
  default:
    "Great question! The best way to learn is by doing — would you like me to launch a guided tour for that feature? You can also browse the Help Center tab for step-by-step articles.",
  campaign:
    "To create a campaign, click **Create campaign** in the sidebar or the Campaigns page. I can also walk you through it with a guided tour — just ask!",
  automation:
    "Automations let you send emails automatically based on triggers like 'contact added' or 'email not opened'. Try the **Set Up Automations** tour in the Launchpad tab!",
  analytics:
    "Analytics shows cross-campaign performance. Navigate to the Analytics section in the sidebar to see open rates, click rates, and funnel data.",
  upgrade:
    "The Pro plan unlocks A/B testing, automations, advanced segmentation, and more. You can upgrade from Settings → Billing.",
  template:
    "Templates are pre-built email layouts. Browse them at Templates in the sidebar. You can filter by category: Newsletter, Announcement, Promo, and more.",
};

function getCannedResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('campaign') || lower.includes('send') || lower.includes('email')) return cannedResponses.campaign;
  if (lower.includes('automat') || lower.includes('workflow') || lower.includes('trigger')) return cannedResponses.automation;
  if (lower.includes('analytic') || lower.includes('report') || lower.includes('stat')) return cannedResponses.analytics;
  if (lower.includes('upgrade') || lower.includes('plan') || lower.includes('billing') || lower.includes('paid')) return cannedResponses.upgrade;
  if (lower.includes('template') || lower.includes('design') || lower.includes('layout')) return cannedResponses.template;
  return cannedResponses.default;
}

function getSuggestedTour(input: string): TourId | null {
  const lower = input.toLowerCase();
  if (lower.includes('automat') || lower.includes('workflow') || lower.includes('trigger')) return 'workflow2';
  if (lower.includes('campaign') || lower.includes('send') || lower.includes('email')) return 'workflow1';
  return null;
}

function renderMessage(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function ChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const { isActive, startTour, startGeneratedTour } = useTour();
  const didInitialDrainRef = useRef(false);

  const clearTourCtaOnMessage = (messageId: string) => {
    setMessages((msgs) =>
      msgs.map((m) =>
        m.id === messageId && m.role === 'orbital' && 'tourCta' in m && m.tourCta
          ? { id: m.id, role: 'orbital' as const, text: m.text }
          : m
      )
    );
  };

  useLayoutEffect(() => {
    if (didInitialDrainRef.current) return;
    didInitialDrainRef.current = true;
    const extra = useStore.getState().drainOrbitalPendingChat();
    if (extra.length) setMessages((m) => [...m, ...extra]);
  }, []);

  useEffect(
    () =>
      useStore.subscribe((state, prev) => {
        if (state.orbitalPendingChat.length <= prev.orbitalPendingChat.length) return;
        const extra = useStore.getState().drainOrbitalPendingChat();
        if (extra.length) setMessages((m) => [...m, ...extra]);
      }),
    []
  );

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const dynamicTour = buildTourFromQuestion(text);
    const suggestedTour = dynamicTour ? null : getSuggestedTour(text);
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text };
    const orbitalMsg: ChatMessage = {
      id: `o-${Date.now()}`,
      role: 'orbital',
      text: dynamicTour?.introMessage ?? getCannedResponse(text),
      ...(suggestedTour
        ? { tourCta: { ctaLabel: 'Start recommended tour', tourId: suggestedTour } }
        : {}),
    };

    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setTimeout(() => setMessages((msgs) => [...msgs, orbitalMsg]), 600);
    if (dynamicTour) {
      setTimeout(() => startGeneratedTour(dynamicTour.steps), 650);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isActive && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-xs text-primary">
            A tour is currently running. Follow the on-screen steps to continue.
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'items-end'}`}
          >
            {msg.role === 'orbital' && (
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-bold">O</span>
              </div>
            )}
            {msg.role === 'orbital' && msg.tourCta ? (
              <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2">
                <div className="max-w-[min(100%,18rem)] rounded-2xl rounded-tl-sm bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed text-text-muted">
                  {renderMessage(msg.text)}
                </div>
                {!isActive && (
                  <button
                    type="button"
                    onClick={() => {
                      startTour(msg.tourCta!.tourId as TourId);
                      clearTourCtaOnMessage(msg.id);
                    }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
                  >
                    {msg.tourCta.ctaLabel}
                    <ChevronRight size={14} className="shrink-0" />
                  </button>
                )}
              </div>
            ) : (
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'orbital'
                    ? 'bg-slate-50 text-text-muted rounded-tl-sm'
                    : 'bg-primary text-white rounded-tr-sm'
                }`}
              >
                {renderMessage(msg.text)}
              </div>
            )}
          </div>
        ))}

        {!messages.some((m) => m.role === 'user') && (
          <div className="space-y-1.5 pl-9">
            <p className="text-xs text-text-muted mb-2">Try asking:</p>
            {[
              'How do I create a campaign?',
              'How do automations work?',
              "What's in the Pro plan?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                  setTimeout(() => {
                    const userMsg: ChatMessage = {
                      id: `u-${Date.now()}`,
                      role: 'user',
                      text: suggestion,
                    };
                    const orbitalMsg: ChatMessage = {
                      id: `o-${Date.now()}`,
                      role: 'orbital',
                      text: getCannedResponse(suggestion),
                    };
                    setMessages((msgs) => [...msgs, userMsg]);
                    setInput('');
                    setTimeout(() => setMessages((msgs) => [...msgs, orbitalMsg]), 600);
                  }, 0);
                }}
                className="block w-full text-left text-xs text-primary bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything…"
            className="flex-1 text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrbitalPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const activeScenario = useStore((s) => s.activeScenario);

  const tabs: { id: Tab; label: string; icon: typeof MessageSquare }[] = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'help', label: 'Help', icon: BookOpen },
    { id: 'launchpad', label: 'Tours', icon: Rocket },
  ];

  return (
    <div className="fixed bottom-20 right-6 z-[1000] w-80 h-[520px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary to-indigo-500">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Orbital</p>
            {activeScenario && (
              <p className="text-[10px] text-white/70">
                {activeScenario === 'maya'
                  ? 'New User Mode'
                  : activeScenario === 'devon'
                  ? 'Trial Conversion Mode'
                  : 'Question-Led Tour Mode'}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-white shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'help' && <HelpCenter />}
        {activeTab === 'launchpad' && <Launchpad onClose={onClose} />}
      </div>
    </div>
  );
}
