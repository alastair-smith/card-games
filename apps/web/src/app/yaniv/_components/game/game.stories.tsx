import { action } from '@ladle/react';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import Game from '.';

export default {
  title: 'Yaniv / Game',
};

const defaultProps: React.ComponentProps<typeof Game> = {
  onEmojiClick: action('Emoji clicked'),
  onEndTurnClick: action('End turn clicked'),
  onYanivClick: action('Yaniv clicked'),
  players: [
    {
      id: '1' as UserId,
      cardCount: 7,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Kevin' as PlayerName,
      score: 200,
    },
    {
      id: '2' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: true,
      isHundredScoreHalved: false,
      name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
        '',
      ) as PlayerName,
      score: 0,
    },
    {
      id: '3' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Paul' as PlayerName,
      score: 0,
    },
    {
      id: '4' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Viola' as PlayerName,
      score: 0,
    },
    {
      id: '5' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Duncan' as PlayerName,
      score: 0,
    },
    {
      id: '6' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Kathy' as PlayerName,
      score: 0,
    },
  ],
};

const limitPlayers = (numberOfPlayers: number) => {
  const props = {
    ...defaultProps,
    players: defaultProps.players.slice(0, numberOfPlayers),
  };
  return () => <Game {...props} />;
};

export const SixPlayers = limitPlayers(6);
export const FivePlayers = limitPlayers(5);
export const FourPlayers = limitPlayers(4);
export const ThreePlayers = limitPlayers(3);
export const TwoPlayers = limitPlayers(2);
