import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  'data-orbital-id'?: string;
}

export default function Card({ children, className = '', onClick, ...rest }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-border shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(79,70,229,0.06)]
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
}
