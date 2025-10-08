import { PlayingCard } from '~/components/ui/playing-card/playing-card';
import { RANKS, Suit } from '~/types/cards';
import { PlayAreaPlayerName, PlayAreaPlayerZone, PlayAreaRoot } from '.';

const RenderZones = ({ zoneCount }: { zoneCount: number }) => {
  return (
    <PlayAreaRoot>
      {Array.from({ length: zoneCount }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: only for story of generated players
        <PlayAreaPlayerZone key={i}>
          <PlayingCard
            card={{ suit: Suit.SPADES, rank: RANKS[i]! }}
            className='scale-80'
          />
          <PlayAreaPlayerName>Player{i + 1}</PlayAreaPlayerName>
        </PlayAreaPlayerZone>
      ))}
    </PlayAreaRoot>
  );
};

export const TenPlayers = () => {
  return <RenderZones zoneCount={10} />;
};
