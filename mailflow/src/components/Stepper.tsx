import { Check } from 'lucide-react';

interface StepperProps {
  steps: { id: string; label: string; orbitalId?: string }[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center gap-2" data-orbital-id={step.orbitalId}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0
                  ${isCompleted ? 'bg-primary text-white' : isActive ? 'bg-primary text-white' : 'bg-slate-100 text-text-muted'}`}
              >
                {isCompleted ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-text' : 'text-text-muted'}`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
