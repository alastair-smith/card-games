import { Card } from '~/components/ui/card';
import { cn } from '~/utils/cn';
import { HowToDialog } from '../how-to';

export default function HowToCard({ className }: { className?: string }) {
  return (
    <Card
      variant='panel'
      className={cn('flex items-center justify-between gap-3 p-4', className)}
    >
      <h2 className='text-xl font-semibold'>New to Yaniv?</h2>
      <HowToDialog />
    </Card>
  );
}
