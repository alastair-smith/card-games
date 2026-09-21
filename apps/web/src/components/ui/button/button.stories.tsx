import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EllipsisVertical } from 'lucide-react';
import { fn } from 'storybook/test';
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
import { Button } from '.';

const meta = {
  title: 'UI Components /Button',
  component: Button,
  args: {
    children: 'Example',
    onClick: fn(),
    variant: 'default',
    size: 'default',
    isLoading: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'danger', 'raw'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'fit'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card>
      <CardHeader className='text-2xl font-medium'>Button</CardHeader>
      <CardContent>
        <Table className='w-fit'>
          <TableCaption>Variations of the Button component</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Loading</TableHead>
              <TableHead>Disabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Primary</TableCell>
              <TableCell>
                <Button>Example</Button>
              </TableCell>
              <TableCell>
                <Button isLoading>Example</Button>
              </TableCell>
              <TableCell>
                <Button disabled>Example</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Secondary</TableCell>
              <TableCell>
                <Button variant='secondary'>Example</Button>
              </TableCell>
              <TableCell>
                <Button variant='secondary' isLoading>
                  Example
                </Button>
              </TableCell>
              <TableCell>
                <Button variant='secondary' disabled>
                  Example
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Danger</TableCell>
              <TableCell>
                <Button variant='danger'>Example</Button>
              </TableCell>
              <TableCell>
                <Button variant='danger' isLoading>
                  Example
                </Button>
              </TableCell>
              <TableCell>
                <Button variant='danger' disabled>
                  Example
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Table className='w-fit mt-8'>
          <TableCaption>Sizes of the Button component</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Size</TableHead>
              <TableHead>Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Small (sm)</TableCell>
              <TableCell>
                <Button size='sm'>Example</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Default</TableCell>
              <TableCell>
                <Button>Example</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Large (lg)</TableCell>
              <TableCell>
                <Button size='lg'>Example</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Icon</TableCell>
              <TableCell>
                <Button size='icon'>
                  <EllipsisVertical />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  ),
};

export const PrimaryLoading: Story = { args: { isLoading: true } };

export const PrimaryDisabled: Story = { args: { disabled: true } };

export const Secondary: Story = { args: { variant: 'secondary' } };

export const SecondaryLoading: Story = {
  args: { variant: 'secondary', isLoading: true },
};

export const SecondaryDisabled: Story = {
  args: { variant: 'secondary', disabled: true },
};

export const Danger: Story = { args: { variant: 'danger' } };

export const DangerLoading: Story = {
  args: { variant: 'danger', isLoading: true },
};

export const DangerDisabled: Story = {
  args: { variant: 'danger', disabled: true },
};
