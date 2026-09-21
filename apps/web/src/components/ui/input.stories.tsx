import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from './input';

const meta = {
  title: 'UI Components / Input',
  component: Input,
  args: {
    placeholder: 'Type here',
    disabled: false,
    readOnly: false,
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TextInput: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'ABC123' },
};
