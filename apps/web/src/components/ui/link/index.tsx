import * as React from 'react';
import { cn } from '~/utils/cn';

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      'cursor-pointer underline ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
      className,
    )}
    {...props}
  />
));
Link.displayName = 'Link';

export { Link };
