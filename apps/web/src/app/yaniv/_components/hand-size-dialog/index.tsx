'use client';

import { ArrowRightCircleIcon } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Slider } from '~/components/ui/slider';
import {
  DEFAULT_HAND_SIZE,
  type HandSize,
  MAX_HAND_SIZE,
  MIN_HAND_SIZE,
} from '~/types/games/yaniv';

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
          {isDealer ? 'Start new round' : 'Choose hand size'}
          <ArrowRightCircleIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <DialogHeader>
            <DialogTitle>Choose the hand size</DialogTitle>
            <DialogDescription>
              How many cards each player is dealt next round.
            </DialogDescription>
          </DialogHeader>
          <Slider
            label='Hand size'
            min={MIN_HAND_SIZE}
            max={MAX_HAND_SIZE}
            value={handSize}
            onValueChange={setHandSize}
            isDisabled={isPending}
          />
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
