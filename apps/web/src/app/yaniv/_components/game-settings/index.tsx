'use client';

import { Card, CardContent, CardHeader } from '~/components/ui/card';
import {
  ChoiceCard,
  ChoiceCardDescription,
  ChoiceCardTitle,
  ChoiceGroup,
} from '~/components/ui/choice-group';
import {
  type Settings,
  type SettingUpdate,
  settingUpdateSchema,
  WINNER_CHOOSES_HAND_SIZE,
} from '~/types/games/yaniv';
import { cn } from '~/utils/cn';

type SettingConfig<Key extends keyof Settings> = {
  key: Key;
  title: string;
  description: string;
  options: readonly {
    value: Settings[Key];
    title: string;
    description: string;
    isWide?: boolean;
  }[];
};

export const GAME_SETTINGS = [
  {
    key: 'handSize',
    title: 'Hand Size',
    description: 'How many cards each player is dealt at the start of a round.',
    options: [
      { value: 5, title: '5 Cards', description: 'For a shorter game' },
      { value: 7, title: '7 Cards', description: 'For a longer game' },
      {
        value: WINNER_CHOOSES_HAND_SIZE,
        title: 'Winner Chooses',
        description: `Each round's winner chooses how many cards are dealt in the next round.`,
        isWide: true,
      },
    ],
  },
  {
    key: 'dealer',
    title: 'Dealer',
    description: 'Who deals each new round after the first.',
    options: [
      {
        value: 'rotates',
        title: 'Rotates',
        description:
          'Take turns to deal. The player after the dealer goes first.',
      },
      {
        value: 'hand-winner',
        title: 'Hand Winner',
        description: `The last hand's winner deals and goes first.`,
      },
    ],
  },
] as const satisfies readonly {
  [Key in keyof Settings]: SettingConfig<Key>;
}[keyof Settings][];

type GameSettingsProps = {
  className?: string;
  settings: Settings;
  isHost: boolean;
  onSettingChange: (update: SettingUpdate) => void;
};

export default function GameSettings({
  className,
  settings,
  isHost,
  onSettingChange,
}: GameSettingsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <h2 className='text-xl font-semibold'>
          {isHost ? 'Settings' : 'Settings (Configured by Host)'}
        </h2>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        {GAME_SETTINGS.map((setting) => {
          const handleValueChange = (value: string) => {
            const option = setting.options.find(
              (choice) => String(choice.value) === value,
            );
            if (option === undefined) return;
            // Parsing ties the value back to its setting, which the loop loses
            onSettingChange(
              settingUpdateSchema.parse({ [setting.key]: option.value }),
            );
          };

          return (
            <section key={setting.key} className='flex flex-col gap-2'>
              <h3 className='font-semibold'>{setting.title}</h3>
              <p>{setting.description}</p>
              <ChoiceGroup
                className='grid-cols-2'
                label={setting.title}
                value={String(settings[setting.key])}
                isDisabled={!isHost}
                onValueChange={handleValueChange}
              >
                {setting.options.map((option) => (
                  <ChoiceCard
                    key={String(option.value)}
                    value={String(option.value)}
                    className={cn(
                      'isWide' in option && option.isWide && 'col-span-2',
                    )}
                  >
                    <ChoiceCardTitle>{option.title}</ChoiceCardTitle>
                    <ChoiceCardDescription>
                      {option.description}
                    </ChoiceCardDescription>
                  </ChoiceCard>
                ))}
              </ChoiceGroup>
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
