import { cn } from '@/utils';

type Variant = 'high' | 'medium' | 'low' | 'work' | 'personal' | 'health' | 'other';

const styles: Record<Variant, string> = {
  high: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  work: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  personal: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  health: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  other: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function Badge({ variant, label }: { variant: Variant; label?: string }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize', styles[variant])}>
      {label ?? variant}
    </span>
  );
}
