import { action } from '@ladle/react';
import { EllipsisVertical } from 'lucide-react';
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

export default {
  title: 'Components / Button',
};

const onClick = action('onClick');

export const Docs = () => (
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
              <Primary />
            </TableCell>
            <TableCell>
              <PrimaryLoading />
            </TableCell>
            <TableCell>
              <PrimaryDisabled />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Secondary</TableCell>
            <TableCell>
              <Secondary />
            </TableCell>
            <TableCell>
              <SecondaryLoading />
            </TableCell>
            <TableCell>
              <SecondaryDisabled />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Danger</TableCell>
            <TableCell>
              <Danger />
            </TableCell>
            <TableCell>
              <DangerLoading />
            </TableCell>
            <TableCell>
              <DangerDisabled />
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
);

export const Primary = () => <Button onClick={onClick}>Example</Button>;
Primary.storyName = 'Primary';

export const PrimaryLoading = () => (
  <Button onClick={onClick} isLoading>
    Example
  </Button>
);
PrimaryLoading.storyName = 'Primary Loading';

export const PrimaryDisabled = () => (
  <Button onClick={onClick} disabled>
    Example
  </Button>
);
PrimaryDisabled.storyName = 'Primary Disabled';

export const Secondary = () => (
  <Button variant='secondary' onClick={onClick}>
    Example
  </Button>
);
Secondary.storyName = 'Secondary';

export const SecondaryLoading = () => (
  <Button variant='secondary' onClick={onClick} isLoading>
    Example
  </Button>
);
SecondaryLoading.storyName = 'Secondary Loading';

export const SecondaryDisabled = () => (
  <Button variant='secondary' onClick={onClick} disabled>
    Example
  </Button>
);
SecondaryDisabled.storyName = 'Secondary Disabled';

export const Danger = () => (
  <Button variant='danger' onClick={onClick}>
    Example
  </Button>
);
Danger.storyName = 'Danger';

export const DangerLoading = () => (
  <Button variant='danger' onClick={onClick} isLoading>
    Example
  </Button>
);
DangerLoading.storyName = 'Danger Loading';

export const DangerDisabled = () => (
  <Button variant='danger' onClick={onClick} disabled>
    Example
  </Button>
);
DangerDisabled.storyName = 'Danger Disabled';
