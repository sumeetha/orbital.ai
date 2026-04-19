import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, Check } from 'lucide-react';

// Button
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const btnBase = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orbital-primary/40 disabled:opacity-50 disabled:pointer-events-none';
const btnVariants: Record<ButtonVariant, string> = {
  primary: 'bg-orbital-primary text-white hover:bg-orbital-primary-hover',
  secondary: 'bg-white text-orbital-text-dark border border-orbital-border-light hover:bg-slate-50',
  ghost: 'text-orbital-text-muted hover:text-orbital-text-dark hover:bg-slate-100',
  danger: 'bg-orbital-danger text-white hover:bg-red-600',
};
const btnSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export function Button({
  variant = 'primary', size = 'md', children, className = '', ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// Input
export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-3 py-2 text-sm border border-orbital-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-orbital-primary/30 focus:border-orbital-primary placeholder:text-orbital-text-muted ${className}`}
      {...props}
    />
  );
}

// Textarea
export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full px-3 py-2 text-sm border border-orbital-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-orbital-primary/30 focus:border-orbital-primary placeholder:text-orbital-text-muted resize-none ${className}`}
      {...props}
    />
  );
}

// Card
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-orbital-border-light shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// Badge
type BadgeColor = 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'emerald';
const badgeColors: Record<BadgeColor, string> = {
  slate: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  violet: 'bg-violet-50 text-violet-700',
  emerald: 'bg-emerald-50 text-emerald-700',
};

export function Badge({ color = 'slate', children, className = '' }: { color?: BadgeColor; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${badgeColors[color]} ${className}`}>
      {children}
    </span>
  );
}

// Chip (removable)
export function Chip({ label, onRemove, color = 'slate' }: { label: string; onRemove?: () => void; color?: BadgeColor }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${badgeColors[color]}`}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70"><X size={12} /></button>
      )}
    </span>
  );
}

// Editable Text
export function EditableText({
  value, onChange, placeholder = 'Click to edit...', multiline = false,
}: { value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => { onChange(draft); setEditing(false); };

  if (editing) {
    return (
      <div className="flex items-start gap-2">
        {multiline ? (
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} autoFocus onBlur={save} />
        ) : (
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus onBlur={save} onKeyDown={(e) => e.key === 'Enter' && save()} />
        )}
        <button onClick={save} className="p-1 text-orbital-success hover:opacity-70 mt-1"><Check size={16} /></button>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2 cursor-pointer" onClick={() => { setDraft(value); setEditing(true); }}>
      <span className={value ? 'text-sm text-orbital-text-dark' : 'text-sm text-orbital-text-muted italic'}>{value || placeholder}</span>
      <Pencil size={14} className="text-orbital-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
    </div>
  );
}

// Modal
export function Modal({ open, onClose, children, title, large }: { open: boolean; onClose: () => void; children: ReactNode; title?: string; large?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className={`relative bg-white rounded-2xl shadow-xl ${large ? 'w-[90vw] h-[85vh]' : 'max-w-lg w-full mx-4'} overflow-hidden`}
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-orbital-border-light">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
              </div>
            )}
            <div className={large ? 'h-full overflow-auto' : ''}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Progress Steps
export function ProgressSteps({ steps, currentStep }: { steps: { label: string; complete: boolean }[]; currentStep: number }) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            step.complete ? 'bg-orbital-success text-white' : i === currentStep ? 'bg-orbital-primary text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            {step.complete ? <Check size={14} /> : i + 1}
          </div>
          <span className={`text-sm ${step.complete ? 'text-orbital-success font-medium' : i === currentStep ? 'text-orbital-text-dark font-medium' : 'text-orbital-text-muted'}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
