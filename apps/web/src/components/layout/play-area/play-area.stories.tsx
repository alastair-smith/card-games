import { Card, CardHeader } from '~/components/ui/card';
import { PlayingCard } from '~/components/ui/playing-card/playing-card';
import { RANKS, Suit } from '~/types/cards';
import { PlayAreaPlayerName, PlayAreaPlayerZone, PlayAreaRoot } from '.';

const RenderZones = ({ zoneCount }: { zoneCount: number }) => {
  const players = Array.from({ length: zoneCount }, (_, i) => {
    return {
      name: `Player ${i}`,
      // biome-ignore lint/style/noNonNullAssertion: rank will always exist
      card: { suit: Suit.SPADES, rank: RANKS[i % (RANKS.length - 1)]! },
    };
  });
  return (
    <PlayAreaRoot>
      {players.map((player) => (
        <PlayAreaPlayerZone key={player.name}>
          <PlayingCard
            card={player.name === 'Player 3' ? null : player.card}
            highlighted={player.name === 'Player 3'}
          />
          <PlayAreaPlayerName>{player.name}</PlayAreaPlayerName>
          {player.name === 'Player 3' && (
            <Card className='rounded'>
              <CardHeader className='p-2'>Your Turn</CardHeader>
            </Card>
          )}
        </PlayAreaPlayerZone>
      ))}
    </PlayAreaRoot>
  );
};

export const TenPlayers = () => {
  return (
    <div className='w-full h-full flex justify-center items-center'>
      <RenderZones zoneCount={10} />
    </div>
  );
};
