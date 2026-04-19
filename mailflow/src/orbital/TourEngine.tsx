import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { workflow1Steps } from './tours/workflow1';
import { workflow2Steps } from './tours/workflow2';

export type TourStep = {
  id: string;
  targetId?: string;
  route?: string;
  message: string;
  subMessage?: string;
  ctaLabel?: string;
  waitForEvent?: string;
  isModal?: boolean;
  /** Modal presentation; default when omitted */
  modalKind?: 'default' | 'surveyEase' | 'surveyIssue';
  /** Success / wrap-up modals — not shown as a numbered tour step */
  excludeFromProgress?: boolean;
  /**
   * `nearest-dialog` — expand the spotlight (and tooltip avoidance) to the nearest `[role="dialog"]`
   * ancestor so the whole dialog stays interactive and the card can sit outside the form.
   */
  spotlightBounds?: 'target' | 'nearest-dialog';
};

/** Feedback and celebration modals are not part of the numbered walkthrough. */
export function stepCountsTowardProgress(step: TourStep): boolean {
  if (step.modalKind === 'surveyEase' || step.modalKind === 'surveyIssue') return false;
  if (step.excludeFromProgress) return false;
  return true;
}

export function getTourProgress(steps: TourStep[], stepIndex: number): { current: number; total: number } {
  const total = steps.filter(stepCountsTowardProgress).length;
  const current = steps.slice(0, stepIndex + 1).filter(stepCountsTowardProgress).length;
  return { current, total };
}

/** Which progress dot is active (handles success modals that are excluded from the count). */
export function getHighlightDotIndex(
  steps: TourStep[],
  stepIndex: number,
  progressSteps: TourStep[],
  currentStep: TourStep | null
): number {
  if (!currentStep) return -1;
  const direct = progressSteps.findIndex((s) => s.id === currentStep.id);
  if (direct >= 0) return direct;
  let best = -1;
  for (let i = 0; i < progressSteps.length; i++) {
    const si = steps.findIndex((s) => s.id === progressSteps[i].id);
    if (si >= 0 && si < stepIndex) best = i;
  }
  return best;
}

export type TourId = 'workflow1' | 'workflow2';

const tourById: Record<TourId, TourStep[]> = {
  workflow1: workflow1Steps,
  workflow2: workflow2Steps,
};

export type SurveyEase = 'easy' | 'difficult' | null;

type TourContextValue = {
  activeTour: TourId | null;
  steps: TourStep[];
  stepIndex: number;
  isActive: boolean;
  currentStep: TourStep | null;
  surveyEase: SurveyEase;
  setSurveyEase: (v: SurveyEase) => void;
  startTour: (id: TourId) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [activeTour, setActiveTour] = useState<TourId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [surveyEase, setSurveyEase] = useState<SurveyEase>(null);
  // Track which route-based events we've navigated to
  const navigatedRef = useRef<string | null>(null);

  const steps = activeTour ? tourById[activeTour] : [];
  const currentStep = steps[stepIndex] ?? null;

  const endTour = useCallback(() => {
    setActiveTour(null);
    setStepIndex(0);
    setSurveyEase(null);
    navigatedRef.current = null;
  }, []);

  const startTour = useCallback(
    (id: TourId) => {
      endTour();
      setActiveTour(id);
      setStepIndex(0);
      setSurveyEase(null);
    },
    [endTour]
  );

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      const nextIndex = i + 1;
      if (nextIndex >= steps.length) {
        setActiveTour(null);
        setSurveyEase(null);
        navigatedRef.current = null;
        return 0;
      }
      return nextIndex;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Navigate when a step specifies a route
  useEffect(() => {
    if (!currentStep?.route) return;
    if (navigatedRef.current === currentStep.route) return;
    navigatedRef.current = currentStep.route;
    navigate(currentStep.route);
  }, [currentStep, navigate]);

  // Listen for bridge events used by waitForEvent
  useEffect(() => {
    if (!currentStep?.waitForEvent) return;
    const eventName = currentStep.waitForEvent;

    // Route-based events:
    //   'route:/campaigns/new'       — exact match
    //   'route:prefix:/automations/' — prefix match (any /automations/:id)
    if (eventName.startsWith('route:')) {
      const isPrefix = eventName.startsWith('route:prefix:');
      const targetRoute = isPrefix
        ? eventName.replace('route:prefix:', '')
        : eventName.replace('route:', '');
      const bridge = (window as any).__mailflow;
      if (!bridge?.on) return;
      const unsub = bridge.on('route:changed', (payload: unknown) => {
        const p = payload as { route: string } | undefined;
        const route = p?.route ?? (window as any).__mailflow?.route ?? '';
        const matches = isPrefix ? route.startsWith(targetRoute) : route === targetRoute;
        if (matches) {
          setTimeout(() => nextStep(), 400);
        }
      });
      return unsub;
    }

    // Standard bridge events
    const bridge = (window as any).__mailflow;
    if (!bridge?.on) return;
    const unsub = bridge.on(
      eventName as Parameters<typeof bridge.on>[0],
      () => {
        setTimeout(() => nextStep(), 800);
      }
    );
    return unsub;
  }, [currentStep, nextStep]);

  return (
    <TourContext.Provider
      value={{
        activeTour,
        steps,
        stepIndex,
        isActive: activeTour !== null,
        currentStep,
        surveyEase,
        setSurveyEase,
        startTour,
        nextStep,
        prevStep,
        endTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used inside <TourProvider>');
  return ctx;
}
