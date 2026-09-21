import type { Meta, StoryObj } from '@storybook/nextjs-vite';
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
import { Switch } from '.';

const meta = {
  title: 'UI Components / Switch',
  component: Switch,
  args: {
    defaultChecked: false,
    disabled: false,
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Checked: Story = { args: { defaultChecked: true } };

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card>
      <CardHeader className='text-2xl font-medium'>Switch</CardHeader>
      <CardContent>
        <p>
          Used for toggling between two states. Should not be used for
          interactions that are hard to reverse.
        </p>
        <Table className='w-fit'>
          <TableCaption>Variations of the Switch component</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead>Checked</TableHead>
              <TableHead>Unchecked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Enabled</TableCell>
              <TableCell>
                <Switch defaultChecked />
              </TableCell>
              <TableCell>
                <Switch />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Disabled</TableCell>
              <TableCell>
                <Switch defaultChecked disabled />
              </TableCell>
              <TableCell>
                <Switch disabled />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  ),
};

export const Unchecked: Story = {};

export const DisabledChecked: Story = {
  args: { defaultChecked: true, disabled: true },
};

export const DisabledUnchecked: Story = { args: { disabled: true } };
