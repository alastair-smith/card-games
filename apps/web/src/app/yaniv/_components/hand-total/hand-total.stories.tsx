import { PLAYER_COLOR_OPTIONS } from '~/utils/player-color';
import HandTotal from '.';

export default {
  title: 'Yaniv / Hand Total',
};

const defaultProps: React.ComponentProps<typeof HandTotal> = {
  color: 'cyan',
  handTotal: 37,
  isFiftyScoreHalved: false,
  totalScore: 28,
};

export const Default = () => <HandTotal {...defaultProps} />;

export const AllColours = () => (
  <div className='grid grid-cols-2 gap-4'>
    {PLAYER_COLOR_OPTIONS.map(({ key, name }) => (
      <div key={key} className='flex flex-col gap-1'>
        <span className='text-dark-text text-sm font-semibold'>{name}</span>
        <HandTotal {...defaultProps} color={key} />
      </div>
    ))}
  </div>
);
