import {
  DatabaseIcon,
  LockIcon,
  MessageCircleQuestionMarkIcon,
  UserLockIcon,
} from 'lucide-react';
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
import { TelemetryToggle } from './telemetry-toggle';

export function About({ className }: { className?: string }) {
  return (
    <Card className={cn('sm:min-w-80', className)}>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <div className='flex flex-col gap-2'>
          <p>Play multiplayer card games online with friends.</p>

          <p>
            Start a game and share the lobby link to invite them to join from
            their own device.
          </p>
        </div>
        <hr />
        <TelemetryToggle />
      </CardContent>

      <CardFooter className='gap-3 justify-end'>
        <Button asChild variant='secondary'>
          <Link href='/privacy-policy'>
            <UserLockIcon /> Privacy Policy
          </Link>
        </Button>
        <Button asChild variant='secondary'>
          <Link href='/contact'>
            <MessageCircleQuestionMarkIcon /> Contact Us
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
