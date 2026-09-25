import type { RoundScore } from '~/types/games/yaniv';

type RoundPointsProps = {
  roundScore: RoundScore;
};

export function RoundPoints({ roundScore }: RoundPointsProps) {
  const { original, adjusted, halvedBy } = roundScore;

  return (
    <span className='whitespace-nowrap'>
      {adjusted}
      {original !== adjusted && (
        <>
          <span aria-hidden='true' className='ml-1 opacity-70'>
            ({original})
          </span>
          <span className='sr-only'>, hand worth {original}</span>
        </>
      )}
      {halvedBy > 0 && (
        <>
          <span aria-hidden='true' className='ml-1 opacity-70'>
            (−{halvedBy})
          </span>
          <span className='sr-only'>, score halved by {halvedBy}</span>
        </>
      )}
    </span>
  );
}
