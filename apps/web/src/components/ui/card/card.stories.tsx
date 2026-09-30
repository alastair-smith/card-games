import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '.';

const meta = {
  title: 'UI Components / Card',
  component: Card,
  args: {
    variant: 'default',
    className: 'max-w-sm',
    children: (
      <>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>A short description</CardDescription>
        </CardHeader>
        <CardContent>Content sits here.</CardContent>
        <CardFooter>Footer</CardFooter>
      </>
    ),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'panel'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Panel: Story = {
  args: { variant: 'panel' },
};
