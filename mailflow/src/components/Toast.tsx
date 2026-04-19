import { useStore } from '../store';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const iconMap = {
  success: <CheckCircle size={18} className="text-success" />,
  error: <AlertCircle size={18} className="text-danger" />,
  info: <Info size={18} className="text-primary" />,
};

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-white border border-border rounded-lg shadow-lg px-4 py-3 min-w-[320px] animate-[slideIn_0.2s_ease-out]"
        >
          {iconMap[t.type]}
          <span className="text-sm text-text flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-text-muted hover:text-text">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
