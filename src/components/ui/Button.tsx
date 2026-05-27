import { cn } from '@/utils';
import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
}

const variants = {
  primary: 'bg-accent text-white hover:opacity-90',
  ghost: 'border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

export default function Button({ variant = 'ghost', className, children, ...props }: Props) {
  return (
    <button
      className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition', variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
