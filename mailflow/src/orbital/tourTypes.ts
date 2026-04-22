export type TourStep = {
  id: string;
  targetId?: string;
  route?: string;
  message: string;
  subMessage?: string;
  ctaLabel?: string;
  waitForEvent?: string;
  /** Optional delay before auto-advance after waitForEvent is satisfied */
  advanceDelayMs?: number;
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
  /** When true the overlay renders nothing — used for invisible wait/pause steps. */
  hidden?: boolean;
  /** Defer rendering of the overlay for this many ms after the step becomes active. */
  showAfterMs?: number;
};

export type TourId = 'workflow1' | 'workflow2';
export type ActiveTourId = TourId | 'generated';
export type SurveyEase = 'easy' | 'difficult' | null;
/** How the most recent step advance happened — determines whether a step's showAfterMs delay applies. */
export type AdvanceReason = 'manual' | 'event' | 'initial';

/** Feedback, celebration modals, and hidden pause steps are not part of the numbered walkthrough. */
export function stepCountsTowardProgress(step: TourStep): boolean {
  if (step.modalKind === 'surveyEase' || step.modalKind === 'surveyIssue') return false;
  if (step.excludeFromProgress) return false;
  if (step.hidden) return false;
  return true;
}

export function getTourProgress(
  steps: TourStep[],
  stepIndex: number
): { current: number; total: number } {
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
