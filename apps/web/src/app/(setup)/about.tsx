import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/utils/cn';

export function About({ className }: { className?: string }) {
  return (
    <Card className={cn('min-w-80', className)}>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <p>
          This is an online platform to play multiplayer card games where the
          dealing and scoring is managed for you.
        </p>

        <p>
          Card games are taught by word of mouth and so many variations of rules
          exist. The rules used in these games are based on the versions of the
          games that I play with my friends!
        </p>

        <p>
          You can find out more about this website <Link href='#'>here</Link>.
        </p>
      </CardContent>
    </Card>
  );
}
