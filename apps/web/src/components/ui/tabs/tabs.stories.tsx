import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '.';

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
