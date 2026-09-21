import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LoadingComponent from './loading';

const meta = {
  title: 'UI Components /Loading',
  component: LoadingComponent,
} satisfies Meta<typeof LoadingComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  decorators: [
    (Story) => (
      <div className='p-10 flex flex-wrap gap-4 h-screen'>
        <Story />
      </div>
    ),
  ],
};
