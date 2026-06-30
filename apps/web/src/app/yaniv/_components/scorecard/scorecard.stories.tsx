import { MAX_NAME_LENGTH, type PlayerName } from '~/types/entities';
import { PLAYER_COLOR_OPTIONS } from '~/utils/player-color';
import Scorecard from '.';

export default {
  title: 'Yaniv / Scorecard',
};

const defaultProps: React.ComponentProps<typeof Scorecard> = {
  color: 'cyan',
  cardCount: 7,
  isFiftyScoreHalved: false,
  isHundredScoreHalved: false,
  name: 'Kevin' as PlayerName,
  score: 0,
  isYanivCalled: false,
};

export const Start = () => <Scorecard {...defaultProps} />;

export const LongName = () => (
  <Scorecard
    {...{
      ...defaultProps,
      name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
        '',
      ) as PlayerName,
    }}
  />
);

export const FiftyScored = () => (
  <Scorecard
    {...{
      ...defaultProps,
      isFiftyScoreHalved: true,
    }}
  />
);

export const HundredScored = () => (
  <Scorecard
    {...{
      ...defaultProps,
      isHundredScoreHalved: true,
    }}
  />
);

export const HighScore = () => (
  <Scorecard
    {...{
      ...defaultProps,
      score: 200,
    }}
  />
);

export const NoCards = () => (
  <Scorecard
    {...{
      ...defaultProps,
      cardCount: 0,
    }}
  />
);

export const CurrentTurn = () => (
  <Scorecard
    {...{
      ...defaultProps,
      isPlayersTurn: true,
    }}
  />
);

export const YanivCalled = () => (
  <Scorecard
    {...{
      ...defaultProps,
      isYanivCalled: true,
    }}
  />
);

export const NullCards = () => (
  <Scorecard
    {...{
      ...defaultProps,
      cardCount: null,
    }}
  />
);

export const ColorOptions = () => (
  <div className='grid grid-cols-3 gap-4'>
    {PLAYER_COLOR_OPTIONS.map(({ key, name }) => (
      <div key={key} className='flex flex-col gap-1'>
        <span className='text-dark-text text-sm font-semibold'>{name}</span>
        <Scorecard {...defaultProps} color={key} />
      </div>
    ))}
  </div>
);
