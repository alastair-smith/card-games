import type { RoundScore } from '~/types/games/yaniv';

type RoundPointsProps = {
  roundScore: RoundScore;
};

export function RoundPoints({ roundScore }: RoundPointsProps) {
  return (
    <span className='whitespace-nowrap'>
      {roundScore.adjusted}
      {roundScore.halvedBy > 0 && (
        <>
          <span aria-hidden='true' className='ml-1 opacity-70'>
            (−{roundScore.halvedBy})
          </span>
          <span className='sr-only'>
            , score halved by {roundScore.halvedBy}
          </span>
        </>
      )}
    </span>
  );
}
