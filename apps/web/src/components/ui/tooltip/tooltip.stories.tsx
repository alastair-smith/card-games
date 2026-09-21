import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentProps } from 'react';
import { Button } from '../button';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '.';

type TooltipStoryProps = ComponentProps<typeof Tooltip> & {
  side: ComponentProps<typeof TooltipContent>['side'];
  label: string;
};

const meta: Meta<TooltipStoryProps> = {
  title: 'UI Components / Tooltip',
  component: Tooltip,
  args: {
    open: true,
    side: 'right',
    label: 'This is a tooltip',
  },
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
  },
  render: ({ side, label, ...args }) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant='secondary'>Ignore me</Button>
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  ),
};

export default meta;

type Story = StoryObj<TooltipStoryProps>;

const SideExample = ({ side }: Pick<TooltipStoryProps, 'side'>) => (
  <Tooltip open={true}>
    <TooltipTrigger asChild>
      <Button variant='secondary'>Ignore me</Button>
    </TooltipTrigger>
    <TooltipContent side={side} sideOffset={8}>
      This is a tooltip
    </TooltipContent>
  </Tooltip>
);

export const Top: Story = { args: { side: 'top' } };

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card>
      <CardHeader className='text-2xl font-medium'>Tooltip</CardHeader>
      <CardContent>
        <Table className='w-fit'>
          <TableCaption>Positions of the Tooltip component</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Top</TableCell>
              <TableCell className='pt-16'>
                <SideExample side='top' />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Right</TableCell>
              <TableCell>
                <SideExample side='right' />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Bottom</TableCell>
              <TableCell className='pb-16'>
                <SideExample side='bottom' />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Left</TableCell>
              <TableCell className='pl-32'>
                <SideExample side='left' />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Table className='w-fit mt-6'>
          <TableCaption>Variations of the Tooltip component</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Permanent</TableCell>
              <TableCell>
                <SideExample side='right' />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Hover</TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button>Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent side='right' sideOffset={8}>
                    This is a tooltip
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  ),
};

export const Right: Story = { args: { side: 'right' } };

export const Bottom: Story = { args: { side: 'bottom' } };

export const Left: Story = { args: { side: 'left' } };

export const Permanent: Story = { args: { open: true } };

export const Hover: Story = {
  args: { open: undefined },
  render: ({ side, label, ...args }) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  ),
};
