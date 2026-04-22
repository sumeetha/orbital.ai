import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import { useTour } from './TourContext';
import type { TourId } from './TourEngine';
import { useStore } from '../store';
import type { ScenarioId } from '../demo/scenarios';

interface BubbleConfig {
  message: string;
  cta: string;
  tourId: TourId;
  delayMs: number;
}

const bubbleByScenario: Record<ScenarioId, BubbleConfig> = {
  maya: {
    message:
      "Looks like you're setting up your first campaign. Want a quick guided walkthrough?",
    cta: "Yes, show me!",
    tourId: 'workflow1',
    delayMs: 5000,
  },
  devon: {
    message:
      "You're getting good engagement on your campaigns 👀 Want a quick walkthrough of how to automate follow-ups?",
    cta: 'Show me how',
    tourId: 'workflow2',
    delayMs: 2000,
  },
  riley: {
    message:
      'Ask me a workflow question and I can build a contextual tour on the fly from what you are trying to do.',
    cta: 'Show me an example',
    tourId: 'workflow2',
    delayMs: 1200,
  },
};

export default function ProactiveBubble({ panelOpen }: { panelOpen?: boolean }) {
  const location = useLocation();
  const { isActive, startTour } = useTour();
  const activeScenario = useStore((s) => s.activeScenario);
  const campaigns = useStore((s) => s.campaigns);
  const handledScenarios = useStore((s) => s.proactiveBubbleHandled);
  const markHandled = useStore((s) => s.markProactiveBubbleHandled);

  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const alreadyHandled = activeScenario ? handledScenarios.includes(activeScenario) : false;

  useEffect(() => {
    if (!activeScenario) return;
    if (alreadyHandled) return;
    if (isActive) return; // don't show while tour is running

    const config = bubbleByScenario[activeScenario];

    // Scenario 1 (Maya): show on the Template step of the wizard after the user hesitates
    if (activeScenario === 'maya') {
      const onWizardTemplate =
        location.pathname === '/campaigns/new' &&
        (location.search === '' || location.search === '?step=1');
      if (!onWizardTemplate) return;
      if (campaigns.length > 0) return;
    } else {
      if (location.pathname !== '/') return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const store = useStore.getState();
      if (store.activeScenario !== activeScenario) return;
      if (store.proactiveBubbleHandled.includes(activeScenario)) return;
      if (activeScenario === 'maya' && store.campaigns.length > 0) return;

      store.enqueueOrbitalProactive({
        messageId: `proactive-${activeScenario}-${Date.now()}`,
        message: config.message,
        ctaLabel: config.cta,
        tourId: config.tourId,
      });
      setVisible(true);
    }, config.delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeScenario, alreadyHandled, isActive, location.pathname, location.search, campaigns.length]);

  // Hide when tour starts
  useEffect(() => {
    if (isActive) setVisible(false);
  }, [isActive]);

  if (!visible || !activeScenario) return null;

  const config = bubbleByScenario[activeScenario];

  // Hide while the Orbital panel is open — avoids overlapping the chat UI
  if (panelOpen) return null;

  const handleCta = () => {
    setVisible(false);
    markHandled(activeScenario);
    useStore.getState().stripOrbitalPendingTourCta();
    startTour(config.tourId);
  };

  const handleDismiss = () => {
    setVisible(false);
    markHandled(activeScenario);
    useStore.getState().clearOrbitalProactiveInbox();
  };

  return (
    <div
      className="fixed bottom-24 right-6 z-[1001] w-72 bg-white rounded-2xl shadow-2xl border border-border animate-in slide-in-from-bottom-4 fade-in duration-300"
      style={{
        animation: 'orbital-bubble-in 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes orbital-bubble-in {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary mb-1">Orbital</p>
            <p className="text-sm text-text-muted leading-relaxed">{config.message}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-text-muted hover:text-text shrink-0 mt-0.5"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex gap-2 mt-3 pl-11">
          <button
            onClick={handleCta}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-primary-hover transition-colors"
          >
            {config.cta}
            <ChevronRight size={13} />
          </button>
          <button
            onClick={handleDismiss}
            className="text-xs text-text-muted hover:text-text px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
