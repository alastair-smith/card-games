import { CheckIcon, HourglassIcon } from 'lucide-react';

export function ReadyStatus({ isReady }: { isReady: boolean }) {
  const Icon = isReady ? CheckIcon : HourglassIcon;

  return (
    <>
      <Icon
        size='1.15em'
        strokeWidth={isReady ? 3.5 : 2.5}
        aria-hidden='true'
        className='shrink-0 text-white icon-outline-black'
      />
      <span className='sr-only'>{isReady ? ', ready' : ', not ready'}</span>
    </>
  );
}
