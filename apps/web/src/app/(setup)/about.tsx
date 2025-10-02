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
    <Card className={cn('min-w-80', className)}>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <p>Play multiplayer card games online.</p>

        <p>
          Launch one of the games below and then share the lobby link with your
          friends so they can each join from their own device.
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
