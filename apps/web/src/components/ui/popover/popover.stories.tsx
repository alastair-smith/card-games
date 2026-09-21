import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../button';
import { Popover, PopoverContent, PopoverTrigger } from '.';

const meta = {
  title: 'UI Components / Popover',
  component: Popover,
  args: {
    defaultOpen: false,
    modal: false,
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant='secondary'>Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className='max-w-48 text-sm'>
          Popover content is portalled out and anchored to its trigger.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const WithRichContent: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant='secondary'>Settings</Button>
      </PopoverTrigger>
      <PopoverContent className='flex flex-col gap-2'>
        <span className='text-sm font-semibold'>Dimensions</span>
        <label className='flex items-center justify-between gap-4 text-sm'>
          Width
          <input
            type='number'
            defaultValue={120}
            className='w-20 rounded border border-border px-2 py-1'
          />
        </label>
        <label className='flex items-center justify-between gap-4 text-sm'>
          Height
          <input
            type='number'
            defaultValue={80}
            className='w-20 rounded border border-border px-2 py-1'
          />
        </label>
      </PopoverContent>
    </Popover>
  ),
};
