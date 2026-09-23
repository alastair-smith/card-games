import type { RoundChange } from './rows';

type RoundPointsProps = {
  roundChange: RoundChange;
};

export function RoundPoints({ roundChange }: RoundPointsProps) {
  return (
    <span className='whitespace-nowrap'>
      {roundChange.adjusted}
      {roundChange.halvedBy > 0 && (
        <>
          <span aria-hidden='true' className='ml-1 opacity-70'>
            (−{roundChange.halvedBy})
          </span>
          <span className='sr-only'>
            , score halved by {roundChange.halvedBy}
          </span>
        </>
      )}
    </span>
  );
}
