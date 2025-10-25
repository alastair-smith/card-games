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

export default {
  title: 'Components/Switch',
};

export const Docs = () => (
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
              <Checked />
            </TableCell>
            <TableCell>
              <Unchecked />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Disabled</TableCell>
            <TableCell>
              <DisabledChecked />
            </TableCell>
            <TableCell>
              <DisabledUnchecked />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export const Checked = () => <Switch defaultChecked />;
Checked.storyName = 'Checked';

export const Unchecked = () => <Switch />;
Unchecked.storyName = 'Unchecked';

export const DisabledChecked = () => <Switch defaultChecked disabled />;
DisabledChecked.storyName = 'Disabled Checked';

export const DisabledUnchecked = () => <Switch disabled />;
DisabledUnchecked.storyName = 'Disabled Unchecked';
