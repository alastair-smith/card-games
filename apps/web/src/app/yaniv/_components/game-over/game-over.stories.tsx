import type { PlayerName, UserId } from '~/types/entities';
import GameOver from '.';

export default {
  title: 'Yaniv / Game Over',
};

export const OneWinner = () => {
  return (
    <GameOver
      userId={'2' as UserId}
      players={[
        {
          id: '1' as UserId,
          name: 'Alice' as PlayerName,
          score: 20,
          isWinner: true,
        },
        {
          id: '2' as UserId,
          name: 'Bob' as PlayerName,
          score: 30,
          isWinner: false,
        },
        {
          id: '3' as UserId,
          name: 'Charlie' as PlayerName,
          score: 40,
          isWinner: false,
        },
        {
          id: '4' as UserId,
          name: 'David' as PlayerName,
          score: 50,
          isWinner: false,
        },
        {
          id: '5' as UserId,
          name: 'Eve' as PlayerName,
          score: 100,
          isWinner: false,
        },
        {
          id: '6' as UserId,
          name: 'Frank' as PlayerName,
          score: 200,
          isWinner: false,
        },
      ]}
    />
  );
};

export const TwoWinners = () => {
  return (
    <GameOver
      userId={'2' as UserId}
      players={[
        {
          id: '1' as UserId,
          name: 'Alice' as PlayerName,
          score: 20,
          isWinner: true,
        },
        {
          id: '2' as UserId,
          name: 'Bob' as PlayerName,
          score: 20,
          isWinner: true,
        },
        {
          id: '3' as UserId,
          name: 'Charlie' as PlayerName,
          score: 40,
          isWinner: false,
        },
        {
          id: '4' as UserId,
          name: 'David' as PlayerName,
          score: 50,
          isWinner: false,
        },
        {
          id: '5' as UserId,
          name: 'Eve' as PlayerName,
          score: 100,
          isWinner: false,
        },
        {
          id: '6' as UserId,
          name: 'Frank' as PlayerName,
          score: 200,
          isWinner: false,
        },
      ]}
    />
  );
};

export const FiveWinners = () => {
  return (
    <GameOver
      userId={'2' as UserId}
      players={[
        {
          id: '1' as UserId,
          name: 'Alice' as PlayerName,
          score: 20,
          isWinner: true,
        },
        {
          id: '2' as UserId,
          name: 'Bob' as PlayerName,
          score: 20,
          isWinner: true,
        },
        {
          id: '3' as UserId,
          name: 'Charlie' as PlayerName,
          score: 20,
          isWinner: true,
        },
        {
          id: '4' as UserId,
          name: 'David' as PlayerName,
          score: 20,
          isWinner: true,
        },
        {
          id: '5' as UserId,
          name: 'Eve' as PlayerName,
          score: 20,
          isWinner: true,
        },
        {
          id: '6' as UserId,
          name: 'Frank' as PlayerName,
          score: 200,
          isWinner: false,
        },
      ]}
    />
  );
};

export const UserWins = () => {
  return (
    <GameOver
      userId={'1' as UserId}
      players={[
        {
          id: '1' as UserId,
          name: 'Alice' as PlayerName,
          score: 20,
          isWinner: true,
        },
        {
          id: '2' as UserId,
          name: 'Bob' as PlayerName,
          score: 30,
          isWinner: false,
        },
        {
          id: '3' as UserId,
          name: 'Charlie' as PlayerName,
          score: 40,
          isWinner: false,
        },
        {
          id: '4' as UserId,
          name: 'David' as PlayerName,
          score: 50,
          isWinner: false,
        },
        {
          id: '5' as UserId,
          name: 'Eve' as PlayerName,
          score: 100,
          isWinner: false,
        },
        {
          id: '6' as UserId,
          name: 'Frank' as PlayerName,
          score: 200,
          isWinner: false,
        },
      ]}
    />
  );
};
