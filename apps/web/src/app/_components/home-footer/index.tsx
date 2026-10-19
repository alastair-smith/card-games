import { Link } from '~/components/ui/link';
import { cn } from '~/utils/cn';
import { SOURCE_CODE_URL } from '~/utils/constants';

export function HomeFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn('text-dark-text text-sm pt-6 pb-8 sm:pb-6', className)}
    >
      <ul className='flex flex-wrap justify-center gap-x-2 gap-y-1'>
        <li>
          <Link href='/privacy-policy'>Privacy Policy</Link>
        </li>
        <li aria-hidden>·</li>
        <li>
          <Link href='/contact'>Contact Us</Link>
        </li>
        <li aria-hidden>·</li>
        <li>
          <Link
            href={SOURCE_CODE_URL}
            target='_blank'
            rel='noopener noreferrer'
          >
            Source Code
          </Link>
        </li>
      </ul>
    </footer>
  );
}
