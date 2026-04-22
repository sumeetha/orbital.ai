import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { workflow1Steps } from './tours/workflow1';
import { workflow2Steps } from './tours/workflow2';
import type { TourStep, TourId, ActiveTourId, SurveyEase } from './tourTypes';
import { TourContext } from './TourContext';

export type { TourStep, TourId, SurveyEase } from './tourTypes';

const tourById: Record<TourId, TourStep[]> = {
  workflow1: workflow1Steps,
  workflow2: workflow2Steps,
};

/** Wizard ?step=1..4 → tour spotlight index 0..3 (first four workflow1 steps). */
function workflow1UrlSpotlightIndex(search: string): number {
  const params = new URLSearchParams(search);
  const n = Math.max(1, Math.min(4, parseInt(params.get('step') ?? '1', 10) || 1));
  return n - 1;
}

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname + location.search;
  const [activeTour, setActiveTour] = useState<ActiveTourId | null>(null);
  const [generatedSteps, setGeneratedSteps] = useState<TourStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [surveyEase, setSurveyEase] = useState<SurveyEase>(null);
  const [stepDeferred, setStepDeferred] = useState(false);
  const navigatedRef = useRef<string | null>(null);
  const deferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Tracks how the upcoming step change was triggered so the mount-effect can decide whether to defer rendering. */
  const pendingAdvanceKindRef = useRef<'event' | 'manual' | null>(null);

  const steps = activeTour ? (activeTour === 'generated' ? generatedSteps : tourById[activeTour]) : [];

  // While on the campaign wizard, never let the spotlight lag the URL by a paint — otherwise
  // TourOverlay's first RAF pass queries the wrong step's target (element not in DOM).
  const resolvedDisplayIndex =
    activeTour === 'workflow1' && location.pathname === '/campaigns/new' && stepIndex < 4
      ? Math.max(stepIndex, workflow1UrlSpotlightIndex(location.search))
      : stepIndex;

  const currentStep = steps[resolvedDisplayIndex] ?? null;

  const clearDeferTimer = () => {
    if (deferTimerRef.current) {
      clearTimeout(deferTimerRef.current);
      deferTimerRef.current = null;
    }
  };

  const endTour = useCallback(() => {
    clearDeferTimer();
    pendingAdvanceKindRef.current = null;
    setActiveTour(null);
    setGeneratedSteps([]);
    setStepIndex(0);
    setSurveyEase(null);
    setStepDeferred(false);
    navigatedRef.current = null;
  }, []);

  const startTour = useCallback(
    (id: TourId) => {
      endTour();
      setActiveTour(id);
      setGeneratedSteps([]);
      setSurveyEase(null);
      setStepDeferred(false);

      // Align first step with the campaign wizard URL so we never "snap back" to ?step=1
      // while the user is already on Audience / Content / Review (breaks spotlight targets).
      let initialIndex = 0;
      if (id === 'workflow1' && location.pathname === '/campaigns/new') {
        initialIndex = workflow1UrlSpotlightIndex(location.search);
      }
      setStepIndex(initialIndex);
    },
    [endTour, location.pathname, location.search]
  );

  const startGeneratedTour = useCallback(
    (dynamicSteps: TourStep[]) => {
      if (!dynamicSteps.length) return;
      endTour();
      setGeneratedSteps(dynamicSteps);
      setActiveTour('generated');
      setStepIndex(0);
      setSurveyEase(null);
      setStepDeferred(false);
    },
    [endTour]
  );

  /** Advance without applying any showAfterMs delay (used for manual Next clicks). */
  const nextStep = useCallback(() => {
    pendingAdvanceKindRef.current = 'manual';
    setStepIndex((i) => i + 1);
  }, []);

  const prevStep = useCallback(() => {
    pendingAdvanceKindRef.current = 'manual';
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  /** Advance triggered by a bridge event (wizard Next click etc.). */
  const advanceByEvent = useCallback(() => {
    pendingAdvanceKindRef.current = 'event';
    setStepIndex((i) => i + 1);
  }, []);

  /**
   * Workflow 1: keep internal stepIndex aligned with the wizard URL (runs before paint so
   * state matches resolvedDisplayIndex for any logic that still reads `stepIndex`).
   */
  useLayoutEffect(() => {
    if (activeTour !== 'workflow1' || location.pathname !== '/campaigns/new') return;
    const urlSpotlightIndex = workflow1UrlSpotlightIndex(location.search);
    setStepIndex((i) => {
      if (i >= 4) return i;
      if (urlSpotlightIndex <= i) return i;
      pendingAdvanceKindRef.current = 'manual';
      return urlSpotlightIndex;
    });
  }, [activeTour, location.pathname, location.search]);

  // React to step changes: end tour if out of range, otherwise apply showAfterMs delay
  // for event-driven advances.
  useEffect(() => {
    if (!activeTour) return;
    if (stepIndex >= steps.length && steps.length > 0) {
      // Tour finished
      endTour();
      return;
    }

    const kind = pendingAdvanceKindRef.current;
    pendingAdvanceKindRef.current = null;
    const delay = currentStep?.showAfterMs ?? 0;

    clearDeferTimer();
    if (kind === 'event' && delay > 0) {
      setStepDeferred(true);
      deferTimerRef.current = setTimeout(() => {
        setStepDeferred(false);
        deferTimerRef.current = null;
      }, delay);
    } else {
      setStepDeferred(false);
    }
  }, [activeTour, stepIndex, steps.length, currentStep, endTour]);

  useEffect(() => {
    if (!currentStep?.route) return;
    const full = location.pathname + location.search;

    if (full === currentStep.route) {
      navigatedRef.current = currentStep.route;
      return;
    }
    if (navigatedRef.current === currentStep.route) return;

    // Campaign wizard: never navigate to an *earlier* ?step= than the URL already shows,
    // or we yank the user back to Templates while the tour index points at Audience.
    if (activeTour === 'workflow1' && currentStep.route.startsWith('/campaigns/new')) {
      const parseWizardStep = (url: string) => {
        const q = url.includes('?') ? url.slice(url.indexOf('?')) : '';
        const n = parseInt(new URLSearchParams(q).get('step') ?? '1', 10);
        return Math.max(1, Math.min(4, Number.isFinite(n) ? n : 1));
      };
      const hereN = parseWizardStep(full);
      const targetN = parseWizardStep(currentStep.route);
      if (hereN > targetN) {
        navigatedRef.current = full;
        return;
      }
    }

    navigatedRef.current = currentStep.route;
    navigate(currentStep.route);
  }, [activeTour, currentStep, navigate, location.pathname, location.search]);

  // Route-based waitForEvent: watch React Router's location directly and advance when it matches.
  // Skips the bridge round-trip entirely, which was proving unreliable.
  useEffect(() => {
    const eventName = currentStep?.waitForEvent;
    if (!eventName || !eventName.startsWith('route:')) return;

    // workflow1 wizard: URL → stepIndex sync is handled by the dedicated effect above.
    if (activeTour === 'workflow1' && eventName.startsWith('route:/campaigns/new?step=')) {
      return;
    }

    const isPrefix = eventName.startsWith('route:prefix:');
    const targetRoute = isPrefix
      ? eventName.replace('route:prefix:', '')
      : eventName.replace('route:', '');
    const matches = isPrefix ? currentRoute.startsWith(targetRoute) : currentRoute === targetRoute;
    if (!matches) return;

    const autoAdvanceDelay = currentStep.advanceDelayMs ?? 0;
    const t = setTimeout(() => advanceByEvent(), autoAdvanceDelay);
    return () => clearTimeout(t);
  }, [activeTour, currentRoute, currentStep, advanceByEvent]);

  // Non-route bridge events (e.g. campaign:sent, template:selected) — still use the bridge.
  useEffect(() => {
    const eventName = currentStep?.waitForEvent;
    if (!eventName || eventName.startsWith('route:')) return;

    const autoAdvanceDelay = currentStep?.advanceDelayMs ?? 0;
    const bridge = (window as any).__mailflow;
    if (!bridge?.on) return;
    const unsub = bridge.on(
      eventName as Parameters<typeof bridge.on>[0],
      () => {
        setTimeout(() => advanceByEvent(), autoAdvanceDelay);
      }
    );
    return unsub;
  }, [currentStep, advanceByEvent]);

  useEffect(() => {
    return () => clearDeferTimer();
  }, []);

  return (
    <TourContext.Provider
      value={{
        activeTour,
        steps,
        stepIndex: resolvedDisplayIndex,
        isActive: activeTour !== null,
        currentStep,
        stepDeferred,
        surveyEase,
        setSurveyEase,
        startTour,
        startGeneratedTour,
        nextStep,
        prevStep,
        endTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}
