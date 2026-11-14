import { GameOver as GameOverScreen } from '~/components/game-over';
import { PlayerTag } from '~/components/player-tag';
import { GameType } from '~/types/game';
import { FINISHING_POSITIONS } from '~/utils/shithead/finishing-positions';
import { buildShareText, type GameOverPlayer, sortByFinish } from './share';

type GameOverProps = {
  players: GameOverPlayer[];
};

export default function GameOver({ players }: GameOverProps) {
  const finishingOrder = sortByFinish(players);
  const winner = finishingOrder[0];

  return (
    <GameOverScreen
      gameType={GameType.SHITHEAD}
      title={winner?.isUser ? 'You win!' : `${winner?.name} wins!`}
      isUserWinner={winner?.isUser ?? false}
      loserEmoji='💩'
      shareText={() => buildShareText(players)}
    >
      <div className='flex flex-col items-center gap-3'>
        <h3 className='font-bold'>Finishing order</h3>
        <ol
          // biome-ignore lint/a11y/noRedundantRoles: Safari drops the list role from an <ol> without list-style
          role='list'
          className='flex flex-col gap-2'
        >
          {finishingOrder.map((player) => (
            <FinishingOrderRow key={player.id} player={player} />
          ))}
        </ol>
      </div>
    </GameOverScreen>
  );
}

function FinishingOrderRow({ player }: { player: GameOverPlayer }) {
  const { label, medal } = FINISHING_POSITIONS[player.finishingPosition];

  return (
    <li className='flex items-center gap-2'>
      <span className='w-8 shrink-0 font-black'>{label}</span>
      <span aria-hidden='true' className='w-7 shrink-0 text-xl'>
        {medal}
      </span>
      <PlayerTag
        name={player.name}
        color={player.color}
        isUser={player.isUser}
        isPlayersTurn={false}
      />
    </li>
  );
}
