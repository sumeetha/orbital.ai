interface KPIStatProps {
  label: string;
  value: string;
  subtext?: string;
  'data-orbital-id'?: string;
}

export default function KPIStat({ label, value, subtext, ...rest }: KPIStatProps) {
  return (
    <div
      className="bg-white rounded-lg border border-border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(79,70,229,0.06)]"
      {...rest}
    >
      <p className="text-sm text-text-muted font-medium">{label}</p>
      <p className="text-2xl font-bold text-text mt-1">{value}</p>
      {subtext && <p className="text-xs text-text-muted mt-1">{subtext}</p>}
    </div>
  );
}
