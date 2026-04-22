import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import OrbitalPanel from './OrbitalPanel';
import ProactiveBubble from './ProactiveBubble';
import TourOverlay from './TourOverlay';
import { useTour } from './TourContext';
import { useStore } from '../store';

export default function OrbitalWidget() {
  const [open, setOpen] = useState(false);
  const { isActive } = useTour();
  const activeScenario = useStore((s) => s.activeScenario);

  useEffect(() => {
    if (isActive) setOpen(false);
  }, [isActive]);

  // Only render when a scenario is active
  if (!activeScenario) return null;

  return (
    <>
      <TourOverlay />
      {!isActive && <ProactiveBubble panelOpen={open} />}

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Orbital AI"
        className={`fixed bottom-6 right-6 z-[1001] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95
          ${open ? 'bg-slate-700' : 'bg-primary'}`}
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageSquare size={22} className="text-white" />
        )}
      </button>

      {/* Panel */}
      {open && <OrbitalPanel onClose={() => setOpen(false)} />}
    </>
  );
}
