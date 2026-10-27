import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { type ComponentProps, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { TabsList, TabsTrigger } from '~/components/ui/tabs';
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsViewport } from '.';

const TABS = [
  { value: 'table', label: 'Table' },
  { value: 'hand', label: 'Hand' },
  { value: 'scores', label: 'Scores' },
] as const;

type SwipeableTabsStoryProps = Pick<
  ComponentProps<typeof SwipeableTabs>,
  'staticQuery'
> & { initialValue: string };

function SwipeableTabsExample({
  initialValue,
  staticQuery,
}: SwipeableTabsStoryProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <SwipeableTabs
      values={TABS.map((tab) => tab.value)}
      value={value}
      onValueChange={setValue}
      staticQuery={staticQuery}
      className='h-80 w-full max-w-sm'
    >
      <SwipeableTabsViewport>
        {TABS.map((tab) => (
          <SwipeableTabsContent
            key={tab.value}
            value={tab.value}
            className='px-2'
          >
            <div className='grid h-full place-items-center rounded-lg border border-border bg-card-background text-2xl font-semibold text-light-text'>
              {tab.label}
            </div>
          </SwipeableTabsContent>
        ))}
      </SwipeableTabsViewport>
      <TabsList className='w-full'>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </SwipeableTabs>
  );
}

const meta = {
  title: 'UI Components / Swipeable Tabs',
  component: SwipeableTabsExample,
  args: { initialValue: 'table' },
  argTypes: {
    initialValue: {
      control: 'inline-radio',
      options: TABS.map((tab) => tab.value),
    },
  },
} satisfies Meta<typeof SwipeableTabsExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Scores' }));
    await expect(canvas.getByRole('tab', { name: 'Scores' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const StartsOnLastTab: Story = { args: { initialValue: 'scores' } };
