import Link from 'next/link';
import { cn } from '~/utils/cn';
import { SOURCE_CODE_URL } from '~/utils/constants';

const LINK_CLASS_NAME =
  'underline-offset-4 hover:underline rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring';

export function HomeFooter({ className }: { className?: string }) {
  return (
    <footer className={cn('text-dark-text text-sm pt-6 pb-8 sm:pb-6', className)}>
      <ul className='flex flex-wrap justify-center gap-x-2 gap-y-1'>
        <li>
          <Link href='/privacy-policy' className={LINK_CLASS_NAME}>
            Privacy Policy
          </Link>
        </li>
        <li aria-hidden>·</li>
        <li>
          <Link href='/contact' className={LINK_CLASS_NAME}>
            Contact Us
          </Link>
        </li>
        <li aria-hidden>·</li>
        <li>
          <Link
            href={SOURCE_CODE_URL}
            target='_blank'
            rel='noopener noreferrer'
            className={LINK_CLASS_NAME}
          >
            Source Code
          </Link>
        </li>
      </ul>
    </footer>
  );
}
