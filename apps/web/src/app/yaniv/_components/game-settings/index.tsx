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

type SettingOption<Value> = {
  value: Value;
  title: string;
  description: string;
  isWide?: boolean;
};

type SettingConfig<Key extends keyof Settings> = {
  key: Key;
  title: string;
  description: string;
  options: readonly SettingOption<Settings[Key]>[];
};

type MissingOptions<
  Key extends keyof Settings,
  Options extends readonly SettingOption<Settings[Key]>[],
> = Exclude<Settings[Key], Options[number]['value']>;

// A setting value without an option fails type checking, naming the value
const defineSetting = <
  Key extends keyof Settings,
  const Options extends readonly SettingOption<Settings[Key]>[],
>(
  setting: SettingConfig<Key> & { options: Options } & ([
      MissingOptions<Key, Options>,
    ] extends [never]
      ? unknown
      : { missingOptions: MissingOptions<Key, Options> }),
): SettingConfig<Key> => setting;

export const GAME_SETTINGS = [
  defineSetting({
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
  }),
  defineSetting({
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
  }),
];

// Looping over the settings loses which value goes with which key, so the
// pairing is checked here instead
const toSettingUpdate = (
  key: keyof Settings,
  value: Settings[keyof Settings],
): SettingUpdate => settingUpdateSchema.parse({ [key]: value });

type GameSettingProps<Key extends keyof Settings> = {
  setting: SettingConfig<Key>;
  value: Settings[Key];
  isDisabled: boolean;
  onChange: (value: Settings[Key]) => void;
};

function GameSetting<Key extends keyof Settings>({
  setting,
  value,
  isDisabled,
  onChange,
}: GameSettingProps<Key>) {
  const handleValueChange = (chosenValue: string) => {
    const option = setting.options.find(
      (choice) => String(choice.value) === chosenValue,
    );
    if (option !== undefined) onChange(option.value);
  };

  return (
    <section className='flex flex-col gap-2'>
      <h3 className='font-semibold'>{setting.title}</h3>
      <p>{setting.description}</p>
      <ChoiceGroup
        className='grid-cols-2'
        label={setting.title}
        value={String(value)}
        isDisabled={isDisabled}
        onValueChange={handleValueChange}
      >
        {setting.options.map((option) => (
          <ChoiceCard
            key={String(option.value)}
            value={String(option.value)}
            className={cn(option.isWide && 'col-span-2')}
          >
            <ChoiceCardTitle>{option.title}</ChoiceCardTitle>
            <ChoiceCardDescription>{option.description}</ChoiceCardDescription>
          </ChoiceCard>
        ))}
      </ChoiceGroup>
    </section>
  );
}

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
        {GAME_SETTINGS.map((setting) => (
          <GameSetting
            key={setting.key}
            setting={setting}
            value={settings[setting.key]}
            isDisabled={!isHost}
            onChange={(value) =>
              onSettingChange(toSettingUpdate(setting.key, value))
            }
          />
        ))}
      </CardContent>
    </Card>
  );
}
