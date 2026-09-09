'use client';

import { Card, CardContent, CardHeader } from '~/components/ui/card';
import {
  ChoiceCard,
  ChoiceCardDescription,
  ChoiceCardTitle,
  ChoiceGroup,
} from '~/components/ui/choice-group';
import { HAND_SIZE_OPTIONS, type HandSize } from '~/types/games/yaniv';

const HAND_SIZE_DESCRIPTIONS = {
  5: 'For a shorter game',
  7: 'For a longer game',
} as const satisfies Record<HandSize, string>;

type GameSettingsProps = {
  className?: string;
  handSize: HandSize;
  isHost: boolean;
  onHandSizeChange: (handSize: string) => void;
};

export default function GameSettings({
  className,
  handSize,
  isHost,
  onHandSizeChange,
}: GameSettingsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <h2 className='text-xl font-semibold'>
          {isHost ? 'Settings' : 'Settings (Configured by Host)'}
        </h2>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <h3 className='font-semibold'>Hand Size</h3>
        <p>How many cards each player is dealt at the start of a round.</p>
        <ChoiceGroup
          className='grid-cols-2'
          label='Hand Size'
          value={String(handSize)}
          isDisabled={!isHost}
          onValueChange={onHandSizeChange}
        >
          {HAND_SIZE_OPTIONS.map((option) => (
            <ChoiceCard key={option} value={String(option)}>
              <ChoiceCardTitle>{option} Cards</ChoiceCardTitle>
              <ChoiceCardDescription>
                {HAND_SIZE_DESCRIPTIONS[option]}
              </ChoiceCardDescription>
            </ChoiceCard>
          ))}
        </ChoiceGroup>
      </CardContent>
    </Card>
  );
}
