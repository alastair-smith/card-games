import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { FlippableBack, FlippableFront, FlippableRoot } from '.';

const faces = (
  <>
    <FlippableFront>
      <div className='bg-green-600 flex justify-center items-center size-full'>
        Front
      </div>
    </FlippableFront>
    <FlippableBack>
      <div className='bg-red-600 flex justify-center items-center size-full'>
        Back
      </div>
    </FlippableBack>
  </>
);

const meta = {
  title: 'Components / Flippable',
  component: FlippableRoot,
  args: {
    showFront: true,
    className: 'w-[100px] h-[100px]',
    children: faces,
  },
} satisfies Meta<typeof FlippableRoot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Front: Story = {};

export const Back: Story = { args: { showFront: false } };

export const FlippableExample: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => {
    const [showFront, setShowFront] = useState(true);

    return (
      <Card>
        <CardHeader>Flippable</CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <FlippableRoot {...args} showFront={showFront} />

          <Button onClick={() => setShowFront((value) => !value)}>Flip</Button>
        </CardContent>
      </Card>
    );
  },
};
