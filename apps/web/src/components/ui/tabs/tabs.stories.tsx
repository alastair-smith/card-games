import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsViewport } from '.';

const meta = {
  title: 'UI Components / Tabs',
  component: Tabs,
  args: {
    defaultValue: 'hand',
    className: 'w-[400px]',
  },
  argTypes: {
    defaultValue: { control: 'select', options: ['hand', 'board'] },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoTabs: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsContent value='hand'>View your cards</TabsContent>
      <TabsContent value='board'>View the table</TabsContent>

      <TabsList>
        <TabsTrigger value='hand'>Hand</TabsTrigger>
        <TabsTrigger value='board'>Board</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

/**
 * With the panels in a viewport, they sit side by side: drag one to swipe to
 * the next, or tap a tab to slide there.
 */
export const Swipeable: Story = {
  render: (args) => (
    <Tabs {...args} className='h-80 w-full max-w-sm'>
      <TabsViewport>
        {[
          { value: 'hand', label: 'View your cards' },
          { value: 'board', label: 'View the table' },
        ].map((panel) => (
          <TabsContent key={panel.value} value={panel.value} className='px-2'>
            <div className='grid h-full place-items-center rounded-lg border border-border bg-card-background text-2xl font-semibold text-light-text'>
              {panel.label}
            </div>
          </TabsContent>
        ))}
      </TabsViewport>

      <TabsList className='w-full'>
        <TabsTrigger value='hand'>Hand</TabsTrigger>
        <TabsTrigger value='board'>Board</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Board' }));
    await expect(
      canvas.getByRole('tabpanel', { name: 'Board' }),
    ).not.toHaveAttribute('inert');
    await expect(
      canvas.getByRole('tabpanel', { name: 'Hand', hidden: true }),
    ).toHaveAttribute('inert');
  },
};

/** The Board tab holds your next move, so it pulses in your colour. */
export const ActionNeeded: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsContent value='hand'>View your cards</TabsContent>
      <TabsContent value='board'>View the table</TabsContent>

      <TabsList>
        <TabsTrigger value='hand'>Hand</TabsTrigger>
        <TabsTrigger value='board' actionColor='purple'>
          Board
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};
