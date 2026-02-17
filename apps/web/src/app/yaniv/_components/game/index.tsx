import { useMemo } from 'react';
import { EmojiRain } from '~/components/emoji-rain/emoji-rain';
import GameLayout from '~/components/layout/game-layout';
import type { PlayerName, UserId } from '~/types/entities';
import { GameType, type ReactionEmoji } from '~/types/game';
import type { YanivPlayingCard } from '~/types/games/yaniv';
import Controls from '../controls';
import Hand from '../hand';
import { HowTo, HowToDialog } from '../how-to';
import PlayArea from '../play-area';
import { RoundSummary } from '../round-summary';
import ScoreCard from '../scorecard';

type BaseGameProps = {
  cards: YanivPlayingCard[];
  onEmojiClick: (emoji: ReactionEmoji) => void;
  onEndTurnClick: () => void;
  onYanivClick: () => void;
  onPlayCards: () => void;
  players: {
    id: UserId;
    cardCount: number;
    isFiftyScoreHalved: boolean;
    isHundredScoreHalved: boolean;
    name: PlayerName;
    score: number;
    isYanivCalled: boolean;
    emojiReaction?: { emoji: ReactionEmoji; id: number };
  }[];
  playerTakingTurn?: PlayerName;
  userId: UserId;
  playedCards: YanivPlayingCard[];
  discardCard: YanivPlayingCard | null;
};

type InProgressGameProps = BaseGameProps & {
  stage: 'waiting-for-player' | 'picking-cards' | 'end-turn';
  roundSummary: null;
};

type EndOfRoundGameProps = BaseGameProps & {
  stage: 'end-of-round';
  roundSummary: {
    id: UserId;
    name: PlayerName;
    score: number;
  }[];
};

type GameProps = InProgressGameProps | EndOfRoundGameProps;

export default function Game({
  onEmojiClick,
  onEndTurnClick,
  onYanivClick,
  onPlayCards,
  players,
  playerTakingTurn,
  stage,
  cards,
  userId,
  playedCards,
  discardCard,
  roundSummary,
}: GameProps) {
  const userPlayer = useMemo(() => {
    return players.find((player) => player.id === userId);
  }, [players, userId]);

  return (
    <GameLayout
      actions={<HowToDialog />}
      gameType={GameType.YANIV}
      className='flex flex-col h-dvh w-full overflow-hidden pb-2 gap-4'
    >
      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
        {players.map(({ id, emojiReaction, ...player }) => (
          <EmojiRain key={id} reaction={emojiReaction}>
            <ScoreCard {...player} />
          </EmojiRain>
        ))}
      </div>

      <div className='flex-1 max-h-120 flex flex-col justify-center items-center'>
        {stage === 'end-of-round' ? (
          <RoundSummary players={roundSummary} />
        ) : (
          <PlayArea
            playedCards={playedCards}
            discardCard={discardCard}
            className='md:text-2xl sm:text-lg h-fit'
          />
        )}
      </div>

      <Controls
        onEmojiClick={onEmojiClick}
        onEndTurnClick={onEndTurnClick}
        onYanivClick={onYanivClick}
        onPlayCards={onPlayCards}
        playerTakingTurn={playerTakingTurn}
        stage={stage}
      />

      <Hand
        cards={cards}
        isFiftyScoreHalved={!!userPlayer?.isFiftyScoreHalved}
        isHundredScoreHalved={!!userPlayer?.isHundredScoreHalved}
        totalScore={userPlayer?.score ?? 0}
        className='md:text-2xl sm:text-lg'
      />
    </GameLayout>
  );
}
