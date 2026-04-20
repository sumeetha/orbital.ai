import { useNavigate } from 'react-router-dom';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useStore } from '../store';
import { scenarios, type ScenarioId } from './scenarios';
import { useTour } from '../orbital/TourEngine';
import { syncBridge } from '../orbital/bridge';

const scenarioList = [scenarios.maya, scenarios.devon, scenarios.riley];

export default function ScenarioSwitcher() {
  const navigate = useNavigate();
  const loadScenario = useStore((s) => s.loadScenario);
  const activeScenario = useStore((s) => s.activeScenario);
  const { endTour } = useTour();

  const handleSelect = (id: ScenarioId) => {
    endTour();
    const scenario = scenarios[id];
    loadScenario(scenario);
    syncBridge(scenario.startRoute);
    navigate(scenario.startRoute);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-slate-900 flex items-center justify-between px-4 z-50 gap-4">
      {/* Brand */}
      <div className="flex items-center gap-2 shrink-0">
        <Sparkles size={14} className="text-indigo-400" />
        <span className="text-xs font-semibold text-white tracking-wide">Orbital.ai Demo</span>
      </div>

      {/* Scenario pills */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 hidden sm:block">Switch scenario:</span>
        {scenarioList.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150
              ${
                activeScenario === s.id
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
          >
            {activeScenario === s.id && (
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
            )}
            {s.label}
          </button>
        ))}
      </div>

      {/* Reset */}
      {activeScenario && (
        <button
          onClick={() => handleSelect(activeScenario)}
          title="Reset scenario"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <RotateCcw size={13} />
          <span className="hidden sm:block">Reset</span>
        </button>
      )}
    </div>
  );
}
