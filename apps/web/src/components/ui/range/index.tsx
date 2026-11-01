import { MiniCard } from '~/components/ui/mini-card';
import { cn } from '~/utils/cn';
import { Button } from '../button';
import { ButtonGroup } from '../button-group';

type RangeProps = React.HTMLAttributes<HTMLDivElement> & {
  max: number;
  min: number;
  onRangeChange: (newValue: [number, number]) => void;
  range: [number, number];
};

export const Range = ({
  min,
  max,
  onRangeChange,
  range: [lowerValue, upperValue],
  ...props
}: RangeProps) => {
  const reduceLowerEnabled = lowerValue > min;
  const increaseLowerEnabled = lowerValue < upperValue;
  const reduceUpperEnabled = upperValue > lowerValue;
  const increaseUpperEnabled = upperValue < max;

  const handleReduceLower = () => {
    if (reduceLowerEnabled) {
      onRangeChange([lowerValue - 1, upperValue]);
    }
  };
  const handleIncreaseLower = () => {
    if (increaseLowerEnabled) {
      onRangeChange([lowerValue + 1, upperValue]);
    }
  };
  const handleReduceUpper = () => {
    if (reduceUpperEnabled) {
      onRangeChange([lowerValue, upperValue - 1]);
    }
  };
  const handleIncreaseUpper = () => {
    if (increaseUpperEnabled) {
      onRangeChange([lowerValue, upperValue + 1]);
    }
  };

  return (
    <div
      className={cn('flex flex-col items-center w-fit gap-2', props.className)}
      {...props}
    >
      <div className='text-xs flex gap-1 justify-between w-full'>
        {Array.from({ length: max }).map((_, index) => (
          <MiniCard
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed items
            key={index}
            isHighlighted={index + 1 >= lowerValue && index + 1 <= upperValue}
          >
            {index + 1}
          </MiniCard>
        ))}
      </div>
      <div className='flex justify-between w-full'>
        <ButtonGroup>
          <Button
            size='sm'
            onClick={handleReduceLower}
            variant='secondary'
            disabled={!reduceLowerEnabled}
          >
            -
          </Button>
          <Button
            size='sm'
            onClick={handleIncreaseLower}
            variant='secondary'
            disabled={!increaseLowerEnabled}
          >
            +
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button
            size='sm'
            onClick={handleReduceUpper}
            variant='secondary'
            disabled={!reduceUpperEnabled}
          >
            -
          </Button>
          <Button
            size='sm'
            onClick={handleIncreaseUpper}
            variant='secondary'
            disabled={!increaseUpperEnabled}
          >
            +
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};
