import Link from 'next/link';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { cn } from '~/utils/cn';

export function About({ className }: { className?: string }) {
  return (
    <Card className={cn('sm:min-w-80', className)}>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <p>Play multiplayer card games online with friends.</p>

        <p>
          Start a game and share the lobby link to invite them to join from
          their own device.
        </p>
      </CardContent>

      <CardFooter className='gap-3 justify-end'>
        <Button asChild variant='secondary'>
          <Link href='/about'>Learn More</Link>
        </Button>

        <Button asChild variant='secondary'>
          <Link href='/contact'>Contact Us</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
