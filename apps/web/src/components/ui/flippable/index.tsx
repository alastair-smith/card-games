import type { ReactNode } from 'react';
import { cn } from '~/utils/cn';

type FlippableRootProps = {
  className?: string;
  children: ReactNode;
  showFront?: boolean;
};

export function FlippableRoot({
  className,
  children,
  showFront = true,
}: FlippableRootProps) {
  return (
    <div
      className={cn(
        'w-full h-full relative duration-700 transform-3d origin-center transition-transform [timing-function:cubic-bezier(0.4,0,0.2,1)]',
        showFront ? 'transform-[rotateY(0deg)]' : 'transform-[rotateY(180deg)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

type FlippableFrontProps = {
  className?: string;
  children: ReactNode;
};

export function FlippableFront({ children, className }: FlippableFrontProps) {
  return (
    <div className={cn('absolute w-full h-full backface-hidden', className)}>
      {children}
    </div>
  );
}

type FlippableBackProps = {
  className?: string;
  children: ReactNode;
};

export function FlippableBack({ children, className }: FlippableBackProps) {
  return (
    <div
      className={cn(
        'absolute w-full h-full backface-hidden transform-[rotateY(180deg)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
