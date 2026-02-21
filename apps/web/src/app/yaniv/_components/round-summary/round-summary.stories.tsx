import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { RoundSummary } from '.';

export default {
  title: 'Yaniv / Round Summary',
};

const defaultProps: React.ComponentProps<typeof RoundSummary> = {
  players: [
    {
      id: '1' as UserId,
      name: 'Kevin' as PlayerName,
      score: 0,
    },
    {
      id: '2' as UserId,
      name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
        '',
      ) as PlayerName,
      score: 8,
    },
    {
      id: '3' as UserId,
      name: 'Paul' as PlayerName,
      score: 12,
    },
    {
      id: '4' as UserId,
      name: 'Viola' as PlayerName,
      score: 20,
    },
    {
      id: '5' as UserId,
      name: 'Sophie' as PlayerName,
      score: 20,
    },
    {
      id: '6' as UserId,
      name: 'John' as PlayerName,
      score: 25,
    },
  ],
};

export const Standard = () => {
  return <RoundSummary {...defaultProps} />;
};
