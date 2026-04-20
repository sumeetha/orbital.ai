import { Play, CheckCircle, Zap, Rocket } from 'lucide-react';
import { useTour, type TourId, getTourProgress } from './TourEngine';
import { useStore } from '../store';

const tours = [
  {
    id: 'workflow1' as TourId,
    icon: Rocket,
    title: 'Send Your First Campaign',
    description:
      'A guided walkthrough from template selection to hitting send — perfect for new users.',
    steps: 5,
    time: '6 min',
    scenarioHint: 'maya',
  },
  {
    id: 'workflow2' as TourId,
    icon: Zap,
    title: 'Set Up Email Automations',
    description:
      'Learn how to create automated follow-up sequences and convert trial users to paid.',
    steps: 5,
    time: '6 min',
    scenarioHint: 'devon',
  },
];

export default function Launchpad({ onClose }: { onClose: () => void }) {
  const { startTour, activeTour, endTour, isActive, stepIndex, steps } = useTour();
  const activeScenario = useStore((s) => s.activeScenario);

  const handleStart = (id: TourId) => {
    if (isActive && activeTour === id) {
      endTour();
    } else {
      startTour(id);
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <p className="text-xs text-text-muted">
        Interactive walkthroughs that guide you through key workflows — step by step.
      </p>

      {tours.map((tour) => {
        const Icon = tour.icon;
        const isRunning = isActive && activeTour === tour.id;
        const isRecommended = activeScenario === tour.scenarioHint;
        const progress =
          isRunning && tour.id === activeTour ? getTourProgress(steps, stepIndex) : null;

        return (
          <div
            key={tour.id}
            className={`rounded-xl border p-4 transition-colors ${
              isRunning
                ? 'border-primary bg-blue-50/50'
                : isRecommended
                ? 'border-primary/40 bg-blue-50/20'
                : 'border-border bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isRunning ? 'bg-primary' : 'bg-slate-100'
                }`}
              >
                <Icon
                  size={18}
                  className={isRunning ? 'text-white' : 'text-text-muted'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-semibold text-text">{tour.title}</p>
                  {isRecommended && !isRunning && (
                    <span className="text-[10px] font-semibold text-primary bg-blue-100 px-1.5 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                  {tour.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                  <span>{tour.steps} steps</span>
                  <span>·</span>
                  <span>~{tour.time}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStart(tour.id)}
              className={`mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  isRunning
                    ? 'bg-white text-primary border border-primary hover:bg-blue-50'
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
            >
              {isRunning ? (
                <>
                  <CheckCircle size={14} />
                  In progress — step {progress?.current ?? stepIndex + 1} of {progress?.total ?? tour.steps}
                </>
              ) : (
                <>
                  <Play size={14} />
                  Start tour
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
