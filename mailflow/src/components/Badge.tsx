type BadgeVariant = 'slate' | 'emerald' | 'amber' | 'red' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  slate: 'bg-slate-100 text-slate-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700',
};

export default function Badge({ children, variant = 'slate', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    draft: 'slate',
    scheduled: 'amber',
    sent: 'emerald',
    active: 'emerald',
    paused: 'slate',
  };
  return <Badge variant={map[status] ?? 'slate'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}
