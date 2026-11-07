'use client';

import { Card, CardContent, CardHeader } from '~/components/ui/card';
import {
  ChoiceCard,
  ChoiceCardDescription,
  ChoiceCardTitle,
  ChoiceGroup,
} from '~/components/ui/choice-group';
import {
  DEALER_SETTINGS,
  type DealerSetting,
  HAND_SIZE_SETTINGS,
  type HandSizeSetting,
  WINNER_CHOOSES_HAND_SIZE,
} from '~/types/games/yaniv';
import { cn } from '~/utils/cn';

const HAND_SIZE_CHOICES = {
  5: { title: '5 Cards', description: 'For a shorter game' },
  7: { title: '7 Cards', description: 'For a longer game' },
  [WINNER_CHOOSES_HAND_SIZE]: {
    title: 'Winner Chooses',
    description: `Each round's winner chooses how many cards are dealt in the next round.`,
  },
} as const satisfies Record<
  HandSizeSetting,
  { title: string; description: string }
>;

const DEALER_CHOICES = {
  rotates: {
    title: 'Rotates',
    description: 'Take turns to deal. The player after the dealer goes first.',
  },
  'hand-winner': {
    title: 'Hand Winner',
    description: `The last hand's winner deals and goes first.`,
  },
} as const satisfies Record<
  DealerSetting,
  { title: string; description: string }
>;

type GameSettingsProps = {
  className?: string;
  handSize: HandSizeSetting;
  dealer: DealerSetting;
  isHost: boolean;
  onHandSizeChange: (handSize: HandSizeSetting) => void;
  onDealerChange: (dealer: DealerSetting) => void;
};

export default function GameSettings({
  className,
  handSize,
  dealer,
  isHost,
  onHandSizeChange,
  onDealerChange,
}: GameSettingsProps) {
  const handleHandSizeValueChange = (value: string) => {
    const option = HAND_SIZE_SETTINGS.find(
      (setting) => String(setting) === value,
    );
    if (option !== undefined) onHandSizeChange(option);
  };

  const handleDealerValueChange = (value: string) => {
    const option = DEALER_SETTINGS.find((setting) => setting === value);
    if (option !== undefined) onDealerChange(option);
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
          onValueChange={handleHandSizeValueChange}
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
        <h3 className='mt-4 font-semibold'>Dealer</h3>
        <p>Who deals each new round after the first.</p>
        <ChoiceGroup
          className='grid-cols-2'
          label='Dealer'
          value={dealer}
          isDisabled={!isHost}
          onValueChange={handleDealerValueChange}
        >
          {DEALER_SETTINGS.map((option) => (
            <ChoiceCard key={option} value={option}>
              <ChoiceCardTitle>{DEALER_CHOICES[option].title}</ChoiceCardTitle>
              <ChoiceCardDescription>
                {DEALER_CHOICES[option].description}
              </ChoiceCardDescription>
            </ChoiceCard>
          ))}
        </ChoiceGroup>
      </CardContent>
    </Card>
  );
}
