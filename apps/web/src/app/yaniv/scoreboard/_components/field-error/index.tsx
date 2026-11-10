import { cn } from '~/utils/cn';

type FieldErrorProps = {
  id: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * The same message a form field gives when it is filled in wrongly, for fields
 * whose value is held in the scoreboard rather than in a form.
 */
export default function FieldError({
  id,
  className,
  children,
}: FieldErrorProps) {
  if (!children) return null;

  return (
    <p
      id={id}
      className={cn('text-danger text-sm font-medium', className)}
      role='alert'
    >
      {children}
    </p>
  );
}
