import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '~/components/ui/button';
import {
  ButtonGroup,
  ButtonGroupChoice,
  ButtonGroupChoiceItem,
} from '~/components/ui/button-group';
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

const sizes = ['S', 'M', 'L', 'XL'];

type ChoiceStoryProps = {
  label: string;
  isDisabled: boolean;
  onValueChange: (value: string) => void;
};

function SizeChoice({ label, isDisabled, onValueChange }: ChoiceStoryProps) {
  const [size, setSize] = useState('M');
  return (
    <ButtonGroupChoice
      label={label}
      value={size}
      isDisabled={isDisabled}
      onValueChange={(value) => {
        setSize(value);
        onValueChange(value);
      }}
    >
      {sizes.map((option) => (
        <ButtonGroupChoiceItem key={option} value={option}>
          {option}
        </ButtonGroupChoiceItem>
      ))}
    </ButtonGroupChoice>
  );
}

const meta = {
  title: 'UI Components / Button Group',
  component: SizeChoice,
  args: {
    label: 'Size',
    isDisabled: false,
    onValueChange: fn(),
  },
} satisfies Meta<typeof SizeChoice>;

export default meta;

type Story = StoryObj<typeof meta>;

// One choice from the buttons, which are radio inputs, so the arrow keys move it.
export const Choice: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('radio', { name: 'M' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    await expect(canvas.getByRole('radio', { name: 'L' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'L' })).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenCalledWith('L');
  },
};

export const DisabledChoice: Story = { args: { isDisabled: true } };

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card>
      <CardHeader className='text-2xl font-medium'>Button Group</CardHeader>
      <CardContent>
        <p>
          Buttons joined into one control. As a choice, they're radio buttons
          styled to match, with one picked at a time.
        </p>
        <Table>
          <TableCaption>Variations of the Button Group component</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Actions</TableCell>
              <TableCell>
                <ButtonGroup>
                  <Button size='sm' variant='secondary'>
                    Undo
                  </Button>
                  <Button size='sm' variant='secondary'>
                    Redo
                  </Button>
                </ButtonGroup>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Choice</TableCell>
              <TableCell>
                <SizeChoice
                  label='Size'
                  isDisabled={false}
                  onValueChange={fn()}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  ),
};
