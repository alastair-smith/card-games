'use client';

import { ArrowRightCircleIcon } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  ButtonGroupChoice,
  ButtonGroupChoiceItem,
} from '~/components/ui/button-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  DEFAULT_HAND_SIZE,
  type HandSize,
  MAX_HAND_SIZE,
  MIN_HAND_SIZE,
} from '~/types/games/yaniv';

const HAND_SIZES: HandSize[] = Array.from(
  { length: MAX_HAND_SIZE - MIN_HAND_SIZE + 1 },
  (_, index) => MIN_HAND_SIZE + index,
);

type HandSizeDialogProps = {
  className?: string;
  isDealer: boolean;
  isPending?: boolean;
  onChooseHandSize: (handSize: HandSize) => void;
};

/**
 * Lets the winner of the last hand pick how many cards are dealt next. It
 * stays open until the round moves on, so a failed choice can be retried.
 */
export function HandSizeDialog({
  className,
  isDealer,
  isPending = false,
  onChooseHandSize,
}: HandSizeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [handSize, setHandSize] = useState<HandSize>(DEFAULT_HAND_SIZE);

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (nextIsOpen) setHandSize(DEFAULT_HAND_SIZE);
    setIsOpen(nextIsOpen);
  };

  const handleHandSizeChange = (value: string) => {
    const size = HAND_SIZES.find((option) => String(option) === value);
    if (size !== undefined) setHandSize(size);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    onChooseHandSize(handSize);
  };

  const cardsText = `${handSize} ${handSize === 1 ? 'card' : 'cards'}`;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={className}>
          Choose hand size
          <ArrowRightCircleIcon />
        </Button>
      </DialogTrigger>
      {/* Less padding on smaller screens leaves the 10 buttons room to reach
          the minimum target size */}
      <DialogContent className='p-4 sm:p-6'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <DialogHeader>
            <DialogTitle>Choose the hand size</DialogTitle>
            <DialogDescription>
              How many cards each player is dealt next round.
            </DialogDescription>
          </DialogHeader>
          <ButtonGroupChoice
            className='w-full'
            label='Hand size'
            value={String(handSize)}
            onValueChange={handleHandSizeChange}
            isDisabled={isPending}
          >
            {HAND_SIZES.map((size) => (
              <ButtonGroupChoiceItem
                key={size}
                value={String(size)}
                // Shares the width evenly, so all 10 fit on smaller screens
                className='min-w-0 flex-1 px-0'
              >
                {size}
              </ButtonGroupChoiceItem>
            ))}
          </ButtonGroupChoice>
          <DialogFooter>
            <Button type='submit' disabled={isPending}>
              {isDealer ? `Deal ${cardsText}` : `Choose ${cardsText}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
