import { createContext, useContext } from 'react';
import type {
  TourStep,
  ActiveTourId,
  TourId,
  SurveyEase,
} from './tourTypes';

export type TourContextValue = {
  activeTour: ActiveTourId | null;
  steps: TourStep[];
  stepIndex: number;
  isActive: boolean;
  currentStep: TourStep | null;
  /** True while a step's `showAfterMs` delay is pending (overlay should be hidden). */
  stepDeferred: boolean;
  surveyEase: SurveyEase;
  setSurveyEase: (v: SurveyEase) => void;
  startTour: (id: TourId) => void;
  startGeneratedTour: (steps: TourStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
};

export const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used inside <TourProvider>');
  return ctx;
}
