import { action } from '@ladle/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { cn } from '~/utils/cn';
import {
  ChoiceCard,
  ChoiceCardDescription,
  ChoiceCardTitle,
  ChoiceGroup,
} from '.';

export default {
  title: 'Components / Choice Group',
};

const onValueChange = action('onValueChange');

const gameModes = [
  {
    value: 'standard',
    name: 'Standard',
    description:
      'Race to 100. Land exactly on 50 or 100 and your score is halved.',
  },
  {
    value: 'quickfire',
    name: 'Quickfire',
    description: 'Race to 50 with no halving — good for a single short game.',
  },
  {
    value: 'marathon',
    name: 'Marathon',
    description: 'Race to 200, with halving at 50, 100 and 150.',
  },
];

const dealers = [
  { value: 'youngest', name: 'Youngest player', isDisabled: false },
  { value: 'last-winner', name: 'Winner of the last round', isDisabled: true },
  { value: 'random', name: 'Random player', isDisabled: false },
];

const scorecardColors = [
  { value: 'yellow', name: 'Butter', swatch: 'bg-yellow' },
  { value: 'blue', name: 'Sky', swatch: 'bg-blue' },
  { value: 'red', name: 'Cherry', swatch: 'bg-red' },
];

export const Docs = () => (
  <Card>
    <CardHeader className='text-2xl font-medium'>Choice Group</CardHeader>
    <CardContent>
      <p>
        One choice from a small set of options, each explained on a card that is
        clickable in full. A card takes whatever content you give it.
      </p>
      <Table>
        <TableCaption>Variations of the Choice Group component</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Variant</TableHead>
            <TableHead>Example</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Default</TableCell>
            <TableCell>
              <Default />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Custom content</TableCell>
            <TableCell>
              <WithCustomContent />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Disabled choice</TableCell>
            <TableCell>
              <WithDisabledChoice />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Disabled</TableCell>
            <TableCell>
              <Disabled />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

type SettingsCardProps = {
  heading: string;
  children: ReactNode;
};

// A settings panel, so the cards are seen on the surface they will live on.
function SettingsCard({ heading, children }: SettingsCardProps) {
  return (
    <Card className='m-4 w-100 max-w-full p-4'>
      <h2 className='m-0 mb-4 text-lg font-semibold'>{heading}</h2>
      {children}
    </Card>
  );
}

// One choice from a set of options that need explaining.
export const Default = () => {
  const [gameMode, setGameMode] = useState('standard');

  return (
    <SettingsCard heading='Game mode'>
      <ChoiceGroup
        label='Game mode'
        value={gameMode}
        onValueChange={(value) => {
          setGameMode(value);
          onValueChange(value);
        }}
      >
        {gameModes.map((mode) => (
          <ChoiceCard key={mode.value} value={mode.value}>
            <ChoiceCardTitle>{mode.name}</ChoiceCardTitle>
            <ChoiceCardDescription>{mode.description}</ChoiceCardDescription>
          </ChoiceCard>
        ))}
      </ChoiceGroup>
    </SettingsCard>
  );
};

// A card takes whatever content you give it, not just a title and description.
export const WithCustomContent = () => (
  <SettingsCard heading='Scorecard colour'>
    <ChoiceGroup
      label='Scorecard colour'
      defaultValue='yellow'
      onValueChange={onValueChange}
    >
      {scorecardColors.map((color) => (
        <ChoiceCard key={color.value} value={color.value}>
          <span className='flex items-center gap-2 font-semibold'>
            <span
              className={cn(
                'size-5 rounded-full border-2 border-border',
                color.swatch,
              )}
            />
            {color.name}
          </span>
        </ChoiceCard>
      ))}
    </ChoiceGroup>
  </SettingsCard>
);

// Choices that are not available yet can be turned off individually.
export const WithDisabledChoice = () => (
  <SettingsCard heading='Who deals first'>
    <ChoiceGroup
      label='Who deals first'
      defaultValue='youngest'
      onValueChange={onValueChange}
    >
      {dealers.map((dealer) => (
        <ChoiceCard
          key={dealer.value}
          value={dealer.value}
          isDisabled={dealer.isDisabled}
        >
          <ChoiceCardTitle>{dealer.name}</ChoiceCardTitle>
        </ChoiceCard>
      ))}
    </ChoiceGroup>
  </SettingsCard>
);

// The whole group can be turned off, e.g. for players who are not the host.
export const Disabled = () => (
  <SettingsCard heading='Game mode'>
    <ChoiceGroup
      label='Game mode'
      defaultValue='standard'
      isDisabled
      onValueChange={onValueChange}
    >
      {gameModes.map((mode) => (
        <ChoiceCard key={mode.value} value={mode.value}>
          <ChoiceCardTitle>{mode.name}</ChoiceCardTitle>
          <ChoiceCardDescription>{mode.description}</ChoiceCardDescription>
        </ChoiceCard>
      ))}
    </ChoiceGroup>
  </SettingsCard>
);
