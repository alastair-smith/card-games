import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '.';

type DialogStoryProps = React.ComponentProps<typeof Dialog> & {
  title: string;
  description: string;
};

const meta: Meta<DialogStoryProps> = {
  title: 'UI Components /Dialog',
  component: Dialog,
  args: {
    defaultOpen: false,
    title: 'Are you absolutely sure?',
    description:
      'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
  },
  render: ({ title, description, ...args }) => (
    <Dialog {...args}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};

export default meta;

type Story = StoryObj<DialogStoryProps>;

export const DialogExample: Story = {};

export const OpenByDefault: Story = { args: { defaultOpen: true } };
