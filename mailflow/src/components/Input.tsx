import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full px-3 py-2 text-sm border border-border rounded-md bg-white
          placeholder:text-text-muted
          focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
          ${className}`}
        {...props}
      />
    </div>
  )
);

Input.displayName = 'Input';
export default Input;
