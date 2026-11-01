import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Card, CardContent, CardHeader } from '../card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table';
import { Slider } from '.';

const meta = {
  title: 'UI Components / Slider',
  component: Slider,
  args: {
    label: 'Hand size',
    defaultValue: 5,
    min: 1,
    max: 10,
    isDisabled: false,
    onValueChange: fn(),
  },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

// The arrow keys move a step at a time, showing the new value beside the label.
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: 'Hand size' });

    slider.focus();
    await userEvent.keyboard('{ArrowRight}');

    await expect(slider).toHaveValue('6');
    await expect(args.onValueChange).toHaveBeenCalledWith(6);
  },
};

export const Disabled: Story = { args: { isDisabled: true } };

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card>
      <CardHeader className='text-2xl font-medium'>Slider</CardHeader>
      <CardContent>
        <p>
          Picks a number from a range, for when the exact value matters less
          than roughly where it sits.
        </p>
        <Table>
          <TableCaption>Variations of the Slider component</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead>Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Enabled</TableCell>
              <TableCell>
                <Slider label='Hand size' defaultValue={5} min={1} max={10} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Disabled</TableCell>
              <TableCell>
                <Slider
                  label='Hand size'
                  defaultValue={5}
                  min={1}
                  max={10}
                  isDisabled
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  ),
};
