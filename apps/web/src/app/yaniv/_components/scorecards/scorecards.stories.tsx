import type { PlayerName, UserId } from '~/types/entities';
import ScoreCards from '.';

export default {
  title: 'Yaniv / Scorecards',
};

const defaultProps: React.ComponentProps<typeof ScoreCards> = {
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
      name: 'Janet' as PlayerName,
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
  return () => <ScoreCards {...props} />;
};

export const SixPlayers = limitPlayers(6);
export const FivePlayers = limitPlayers(5);
export const FourPlayers = limitPlayers(4);
export const ThreePlayers = limitPlayers(3);
export const TwoPlayers = limitPlayers(2);
