'use client';

import { Card, CardContent, CardHeader } from '~/components/ui/card';
import {
  ChoiceCard,
  ChoiceCardDescription,
  ChoiceCardTitle,
  ChoiceGroup,
} from '~/components/ui/choice-group';
import {
  HAND_SIZE_SETTINGS,
  type HandSizeSetting,
  MAX_HAND_SIZE,
  MIN_HAND_SIZE,
  WINNER_CHOOSES_HAND_SIZE,
} from '~/types/games/yaniv';
import { cn } from '~/utils/cn';

const HAND_SIZE_CHOICES = {
  5: { title: '5 Cards', description: 'For a shorter game' },
  7: { title: '7 Cards', description: 'For a longer game' },
  [WINNER_CHOOSES_HAND_SIZE]: {
    title: 'Winner Chooses',
    description: `The winner of each hand picks ${MIN_HAND_SIZE} to ${MAX_HAND_SIZE} cards for the next`,
  },
} as const satisfies Record<
  HandSizeSetting,
  { title: string; description: string }
>;

type GameSettingsProps = {
  className?: string;
  handSize: HandSizeSetting;
  isHost: boolean;
  onHandSizeChange: (handSize: HandSizeSetting) => void;
};

export default function GameSettings({
  className,
  handSize,
  isHost,
  onHandSizeChange,
}: GameSettingsProps) {
  const handleValueChange = (value: string) => {
    const option = HAND_SIZE_SETTINGS.find(
      (setting) => String(setting) === value,
    );
    if (option !== undefined) onHandSizeChange(option);
  };

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
          onValueChange={handleValueChange}
        >
          {HAND_SIZE_SETTINGS.map((option) => (
            <ChoiceCard
              key={option}
              value={String(option)}
              className={cn(
                option === WINNER_CHOOSES_HAND_SIZE && 'col-span-2',
              )}
            >
              <ChoiceCardTitle>
                {HAND_SIZE_CHOICES[option].title}
              </ChoiceCardTitle>
              <ChoiceCardDescription>
                {HAND_SIZE_CHOICES[option].description}
              </ChoiceCardDescription>
            </ChoiceCard>
          ))}
        </ChoiceGroup>
      </CardContent>
    </Card>
  );
}
