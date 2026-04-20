import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useTour, getTourProgress, getHighlightDotIndex, stepCountsTowardProgress } from './TourEngine';
import { useStore } from '../store';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPos {
  top: number;
  left: number;
  arrowSide: 'top' | 'bottom' | 'left' | 'right';
}

const TOOLTIP_W = 340;
/** Initial estimate before the card is measured; real height tightens the gap to the spotlight */
const TOOLTIP_H_ESTIMATE = 200;
const GAP = 10;
const PAD = 12;

function rectsOverlap(
  a: { left: number; top: number; width: number; height: number },
  b: SpotlightRect,
  margin = 6
): boolean {
  const bx = b.left - margin;
  const by = b.top - margin;
  const bw = b.width + margin * 2;
  const bh = b.height + margin * 2;
  return !(a.left + a.width <= bx || a.left >= bx + bw || a.top + a.height <= by || a.top >= by + bh);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

type Candidate = { top: number; left: number; arrowSide: TooltipPos['arrowSide'] };

/** Prefer placements that do not cover the highlight; order depends on where the target sits in the viewport. */
function getTooltipPos(rect: SpotlightRect, tooltipH: number): TooltipPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tw = TOOLTIP_W;
  const th = tooltipH;

  const above: Candidate = {
    top: rect.top - th - GAP,
    left: rect.left + rect.width / 2 - tw / 2,
    arrowSide: 'bottom',
  };
  const below: Candidate = {
    top: rect.top + rect.height + GAP,
    left: rect.left + rect.width / 2 - tw / 2,
    arrowSide: 'top',
  };
  const leftOf: Candidate = {
    top: rect.top + rect.height / 2 - th / 2,
    left: rect.left - tw - GAP,
    arrowSide: 'right',
  };
  const rightOf: Candidate = {
    top: rect.top + rect.height / 2 - th / 2,
    left: rect.left + rect.width + GAP,
    arrowSide: 'left',
  };

  const nearTop = rect.top < vh * 0.36;
  const nearBottom = rect.top + rect.height > vh * 0.76;
  const comfortableBelow = rect.top + rect.height + GAP + th <= vh - PAD;
  const comfortableAbove = rect.top - GAP - th >= PAD;
  const roomBelow = vh - rect.top - rect.height - GAP - PAD;
  const roomAbove = rect.top - GAP - PAD;

  let order: Candidate[];
  if (nearBottom) {
    order = [above, below, leftOf, rightOf];
  } else if (nearTop) {
    // e.g. automation trigger under header — "above" often clamps into the target
    order = [below, above, rightOf, leftOf];
  } else if (comfortableBelow && (!comfortableAbove || roomBelow >= roomAbove)) {
    // e.g. in-modal primary at bottom — place card under the control, not over the form
    order = [below, above, rightOf, leftOf];
  } else if (comfortableAbove && !comfortableBelow) {
    order = [above, below, leftOf, rightOf];
  } else if (roomBelow >= roomAbove) {
    order = [below, above, rightOf, leftOf];
  } else {
    order = [above, below, leftOf, rightOf];
  }

  const tryPlacements = (pad: number): TooltipPos | null => {
    for (const c of order) {
      const left = clamp(c.left, pad, vw - tw - pad);
      const top = clamp(c.top, pad, vh - th - pad);
      const box = { left, top, width: tw, height: th };
      if (!rectsOverlap(box, rect)) {
        return { top, left, arrowSide: c.arrowSide };
      }
    }
    return null;
  };

  return (
    tryPlacements(PAD) ??
    tryPlacements(4) ?? {
      top: clamp(rect.top + rect.height + GAP, PAD, vh - th - PAD),
      left: clamp(rect.left + rect.width / 2 - tw / 2, PAD, vw - tw - PAD),
      arrowSide: 'top',
    }
  );
}

function renderMessage(text: string) {
  // Convert **bold** markdown to <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') ? (
      <strong key={i} className="font-semibold text-text">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function TourOverlay() {
  const { isActive, currentStep, steps, stepIndex, nextStep, prevStep, endTour, surveyEase, setSurveyEase } =
    useTour();
  const navigate = useNavigate();
  const addToast = useStore((s) => s.addToast);
  const [spotRect, setSpotRect] = useState<SpotlightRect | null>(null);
  const [issueDetail, setIssueDetail] = useState('');
  const [tooltipMeasuredH, setTooltipMeasuredH] = useState(TOOLTIP_H_ESTIMATE);
  const rafRef = useRef<number>(0);
  const tooltipCardRef = useRef<HTMLDivElement>(null);

  const progressSteps = useMemo(() => steps.filter(stepCountsTowardProgress), [steps]);
  const tourProgress = getTourProgress(steps, stepIndex);
  const highlightDotIndex = getHighlightDotIndex(steps, stepIndex, progressSteps, currentStep);

  useEffect(() => {
    setTooltipMeasuredH(TOOLTIP_H_ESTIMATE);
  }, [currentStep?.id]);

  useLayoutEffect(() => {
    const el = tooltipCardRef.current;
    if (!el || !isActive || currentStep?.isModal) return;
    const h = Math.ceil(el.getBoundingClientRect().height);
    if (h > 0) {
      setTooltipMeasuredH((prev) => (Math.abs(prev - h) > 2 ? h : prev));
    }
  }, [
    isActive,
    currentStep?.id,
    currentStep?.isModal,
    currentStep?.message,
    currentStep?.subMessage,
    spotRect?.top,
    spotRect?.left,
    spotRect?.width,
    spotRect?.height,
    currentStep?.waitForEvent,
  ]);

  useEffect(() => {
    if (!isActive || !currentStep?.targetId) return;
    const scrollTargets: Record<string, ScrollIntoViewOptions> = {
      'wizard-send-btn': { block: 'end', behavior: 'smooth', inline: 'nearest' },
      'automations-create-btn': { block: 'center', behavior: 'smooth', inline: 'nearest' },
      'automations-trigger-node': { block: 'center', behavior: 'smooth', inline: 'nearest' },
      'automations-add-step-area': { block: 'center', behavior: 'smooth', inline: 'nearest' },
      'automations-add-step-btn': { block: 'center', behavior: 'smooth', inline: 'nearest' },
      'settings-upgrade-btn': { block: 'center', behavior: 'smooth', inline: 'nearest' },
    };
    const opts = scrollTargets[currentStep.targetId];
    if (!opts) return;
    const t = window.setTimeout(() => {
      const el = document.querySelector(
        `[data-orbital-id="${currentStep.targetId}"]`
      ) as HTMLElement | null;
      el?.scrollIntoView(opts);
    }, 80);
    return () => clearTimeout(t);
  }, [isActive, currentStep?.targetId]);

  useLayoutEffect(() => {
    if (currentStep?.modalKind === 'surveyIssue' && surveyEase === null) {
      prevStep();
    }
  }, [currentStep, surveyEase, prevStep]);

  useEffect(() => {
    if (currentStep?.modalKind === 'surveyIssue') setIssueDetail('');
  }, [currentStep?.id, currentStep?.modalKind, surveyEase]);

  // Poll for the target element's position every animation frame
  useEffect(() => {
    if (!isActive || !currentStep || currentStep.isModal || !currentStep.targetId) {
      setSpotRect(null);
      return;
    }

    const poll = () => {
      const el = document.querySelector(
        `[data-orbital-id="${currentStep.targetId}"]`
      ) as HTMLElement | null;
      if (el) {
        const pad = 6;
        if (currentStep.spotlightBounds === 'nearest-dialog') {
          const dialog = el.closest('[role="dialog"]') as HTMLElement | null;
          if (dialog) {
            const d = dialog.getBoundingClientRect();
            setSpotRect({
              top: d.top - pad,
              left: d.left - pad,
              width: d.width + pad * 2,
              height: d.height + pad * 2,
            });
          } else {
            const r = el.getBoundingClientRect();
            setSpotRect({ top: r.top - 4, left: r.left - 4, width: r.width + 8, height: r.height + 8 });
          }
        } else {
          const r = el.getBoundingClientRect();
          setSpotRect({ top: r.top - 4, left: r.left - 4, width: r.width + 8, height: r.height + 8 });
        }
      } else {
        setSpotRect(null);
      }
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, currentStep]);

  if (!isActive || !currentStep) return null;

  const isLastStep = stepIndex === steps.length - 1;
  const isWaiting = !!currentStep.waitForEvent;
  const modalKind = currentStep.modalKind ?? 'default';

  const handleNext = () => {
    if (currentStep.isModal && currentStep.id === 'w1-done') {
      nextStep();
      return;
    }
    if (currentStep.isModal && currentStep.ctaLabel === 'See upgrade options') {
      nextStep();
      return;
    }
    if (currentStep.isModal && currentStep.ctaLabel === 'Upgrade now') {
      endTour();
      navigate('/settings');
      return;
    }
    if (!isWaiting) nextStep();
  };

  // Micro-survey: ease (two explicit choices)
  if (currentStep.isModal && modalKind === 'surveyEase') {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={endTour} />
        <div
          className="relative z-10 w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={endTour}
            className="absolute right-4 top-4 text-text-muted hover:text-text"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
              <span className="text-sm font-bold text-white">O</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Orbital</p>
              <p className="text-xs text-text-muted">Quick check-in</p>
            </div>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-text-muted">{currentStep.message}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="flex-1 rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-text transition-colors hover:border-primary/50 hover:bg-blue-50/50"
              onClick={() => {
                setSurveyEase('easy');
                nextStep();
              }}
            >
              Pretty easy
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-text transition-colors hover:border-primary/50 hover:bg-blue-50/50"
              onClick={() => {
                setSurveyEase('difficult');
                nextStep();
              }}
            >
              Not so easy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Micro-survey: follow-up (positive thank-you or negative free-text)
  if (currentStep.isModal && modalKind === 'surveyIssue') {
    const finishPositive = () => {
      addToast('Thanks — glad the first send felt smooth.', 'success');
      endTour();
    };
    const finishNegative = () => {
      const detail = issueDetail.trim();
      if (!detail) return;
      addToast(`Thanks for the detail — we'll use this to improve the experience.`, 'success');
      endTour();
    };

    if (surveyEase === null) {
      return <div className="fixed inset-0 z-[1000] bg-black/20" aria-hidden />;
    }

    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={endTour} />
        <div
          className="relative z-10 w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={endTour}
            className="absolute right-4 top-4 text-text-muted hover:text-text"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
              <span className="text-sm font-bold text-white">O</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Orbital</p>
              <p className="text-xs text-text-muted">Quick check-in</p>
            </div>
          </div>

          {surveyEase === 'easy' ? (
            <>
              <p className="mb-1 text-sm font-medium text-text">Great to hear.</p>
              <p className="mb-5 text-sm leading-relaxed text-text-muted">
                Thanks for walking through your first campaign — enjoy exploring MailFlow.
              </p>
              <button
                type="button"
                onClick={finishPositive}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <p className="mb-1 text-sm font-medium text-text">Sorry that was rough.</p>
              <p className="mb-3 text-sm leading-relaxed text-text-muted">
                What issue did you run into? A sentence is enough — it helps us fix the rough edges.
              </p>
              <textarea
                value={issueDetail}
                onChange={(e) => setIssueDetail(e.target.value)}
                rows={4}
                placeholder="e.g. I wasn't sure which audience to pick…"
                className="mb-3 w-full resize-none rounded-lg border border-border px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
              <button
                type="button"
                disabled={!issueDetail.trim()}
                onClick={finishNegative}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit feedback
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Default modal step — centered overlay card
  if (currentStep.isModal) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={endTour} />
        <div className="relative z-10 w-[380px] bg-white rounded-2xl shadow-2xl p-6">
          <button
            onClick={endTour}
            className="absolute top-4 right-4 text-text-muted hover:text-text"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">O</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">Orbital</p>
              <p className="text-xs text-text-muted">
                {currentStep.excludeFromProgress ? (
                  <>Walkthrough complete</>
                ) : (
                  <>
                    Step {tourProgress.current} of {tourProgress.total}
                  </>
                )}
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line mb-2">
            {renderMessage(currentStep.message)}
          </p>
          {currentStep.subMessage && (
            <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-primary">
              {currentStep.subMessage}
            </p>
          )}

          <div className="flex items-center justify-between mt-5">
            <div className="flex gap-1">
              {progressSteps.map((_, i) => (
                <div
                  key={progressSteps[i].id}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i === highlightDotIndex ? 'bg-primary' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={endTour}
                className="text-xs text-text-muted hover:text-text px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Dismiss
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 text-xs font-medium bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary-hover transition-colors"
              >
                {currentStep.ctaLabel ?? (isLastStep ? 'Done' : 'Next')}
                {!isLastStep && <ChevronRight size={13} />}
                {isLastStep && <Check size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Spotlight step
  const tooltipPos = spotRect ? getTooltipPos(spotRect, tooltipMeasuredH) : null;

  return (
    <>
      {/* Darkened backdrop */}
      <div className="fixed inset-0 z-[999] pointer-events-none" />

      {spotRect && (
        <>
          {/* Spotlight cut-out using 4 overlay divs */}
          <div
            className="fixed z-[999] bg-black/50 pointer-events-auto"
            style={{ top: 0, left: 0, right: 0, height: spotRect.top }}
            onClick={endTour}
          />
          <div
            className="fixed z-[999] bg-black/50 pointer-events-auto"
            style={{
              top: spotRect.top,
              left: 0,
              width: spotRect.left,
              height: spotRect.height,
            }}
            onClick={endTour}
          />
          <div
            className="fixed z-[999] bg-black/50 pointer-events-auto"
            style={{
              top: spotRect.top,
              left: spotRect.left + spotRect.width,
              right: 0,
              height: spotRect.height,
            }}
            onClick={endTour}
          />
          <div
            className="fixed z-[999] bg-black/50 pointer-events-auto"
            style={{
              top: spotRect.top + spotRect.height,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onClick={endTour}
          />

          {/* Highlight ring around the element */}
          <div
            className="fixed z-[1000] rounded-lg pointer-events-none"
            style={{
              top: spotRect.top,
              left: spotRect.left,
              width: spotRect.width,
              height: spotRect.height,
              boxShadow: '0 0 0 2px #0984e3, 0 0 0 4px rgba(9,132,227,0.3)',
            }}
          />
        </>
      )}

      {/* Tooltip card */}
      {tooltipPos && (
        <div
          ref={tooltipCardRef}
          className="fixed z-[1001] w-[340px] bg-white rounded-2xl shadow-2xl p-5"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">O</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Orbital</p>
                <p className="text-xs text-text-muted">
                  Step {tourProgress.current} of {tourProgress.total}
                </p>
              </div>
            </div>
            <button onClick={endTour} className="text-text-muted hover:text-text">
              <X size={15} />
            </button>
          </div>

          <p className="text-sm text-text-muted leading-relaxed mb-1">
            {renderMessage(currentStep.message)}
          </p>
          {currentStep.subMessage && (
            <p className="text-xs text-text-muted bg-slate-50 rounded-lg px-3 py-2 mt-2">
              {currentStep.subMessage}
            </p>
          )}

          {isWaiting && (
            <p className="text-xs text-primary mt-2 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Waiting for your action…
            </p>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1">
              {progressSteps.map((_, i) => (
                <div
                  key={progressSteps[i].id}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === highlightDotIndex ? 'bg-primary' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {stepIndex > 0 && !isWaiting && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-text px-2 py-1.5 rounded-lg hover:bg-slate-100"
                >
                  <ChevronLeft size={13} />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isWaiting}
                className={`flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-lg transition-colors
                  ${
                    isWaiting
                      ? 'bg-slate-100 text-text-muted cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-hover'
                  }`}
              >
                {currentStep.ctaLabel ?? (isLastStep ? 'Done' : 'Next')}
                {!isLastStep && !isWaiting && <ChevronRight size={13} />}
                {isLastStep && !isWaiting && <Check size={13} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If target element not found yet, show centered loading indicator */}
      {!spotRect && !currentStep.isModal && (
        <div className="fixed inset-0 z-[999] bg-black/50 flex items-end justify-center pb-32 pointer-events-none">
          <div className="bg-white rounded-xl px-4 py-3 text-sm text-text-muted shadow-lg pointer-events-none">
            Navigating…
          </div>
        </div>
      )}
    </>
  );
}
