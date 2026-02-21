import { MAX_NAME_LENGTH, type PlayerName } from '~/types/entities';
import Scorecard from '.';

export default {
  title: 'Yaniv / Scorecard',
};

const defaultProps: React.ComponentProps<typeof Scorecard> = {
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
