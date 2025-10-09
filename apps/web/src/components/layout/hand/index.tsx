import type { ReactNode } from 'react';
import { cn } from '~/utils/cn';

export type HandProps = {
  children?: ReactNode;
  className?: string;
};
export function Hand({ children, className }: HandProps) {
  return <div className={cn(className)}>{children}</div>;
}
