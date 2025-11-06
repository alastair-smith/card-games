import { PlayingCard } from '~/components/ui/playing-card/playing-card';
import { RANKS, Suit } from '~/types/cards';
import { PlayAreaPlayerName, PlayAreaPlayerZone, PlayAreaRoot } from '.';

const RenderZones = ({ zoneCount }: { zoneCount: number }) => {
  const players = Array.from({ length: zoneCount }, (_, i) => {
    return {
      name: `Player ${i + 1}`,
      // biome-ignore lint/style/noNonNullAssertion: rank will always exist
      card: { suit: Suit.SPADES, rank: RANKS[i % (RANKS.length - 1)]! },
    };
  });
  return (
    <div className='w-full h-[70vh] flex justify-center items-center'>
      <PlayAreaRoot className='h-full w-full'>
        {players.map((player) => (
          <PlayAreaPlayerZone key={player.name}>
            <PlayingCard
              card={player.name === 'Player 3' ? null : player.card}
              highlighted={player.name === 'Player 3'}
              className='text-2xl'
            />
            <PlayAreaPlayerName>{player.name}</PlayAreaPlayerName>
          </PlayAreaPlayerZone>
        ))}
      </PlayAreaRoot>
    </div>
  );
};

export const PlayArea10 = () => {
  return <RenderZones zoneCount={10} />;
};

export const PlayArea9 = () => {
  return <RenderZones zoneCount={9} />;
};

export const PlayArea8 = () => {
  return <RenderZones zoneCount={8} />;
};

export const PlayArea7 = () => {
  return <RenderZones zoneCount={7} />;
};

export const PlayArea6 = () => {
  return <RenderZones zoneCount={6} />;
};

export const PlayArea5 = () => {
  return <RenderZones zoneCount={5} />;
};

export const PlayArea4 = () => {
  return <RenderZones zoneCount={4} />;
};

export const PlayArea3 = () => {
  return <RenderZones zoneCount={3} />;
};

export const PlayArea2 = () => {
  return <RenderZones zoneCount={2} />;
};
