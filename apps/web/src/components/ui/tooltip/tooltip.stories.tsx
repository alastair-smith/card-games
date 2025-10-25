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

export default {
  title: 'Components/Tooltip',
};

export const Docs = () => (
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
              <Top />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Right</TableCell>
            <TableCell>
              <Right />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Bottom</TableCell>
            <TableCell className='pb-16'>
              <Bottom />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Left</TableCell>
            <TableCell className='pl-32'>
              <Left />
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
              <Permanent />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Hover</TableCell>
            <TableCell>
              <Hover />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export const Top = () => (
  <Tooltip open={true}>
    <TooltipTrigger asChild>
      <Button variant='secondary'>Ignore me</Button>
    </TooltipTrigger>
    <TooltipContent side='top' sideOffset={8}>
      This is a tooltip
    </TooltipContent>
  </Tooltip>
);

export const Right = () => (
  <Tooltip open={true}>
    <TooltipTrigger asChild>
      <Button variant='secondary'>Ignore me</Button>
    </TooltipTrigger>
    <TooltipContent side='right' sideOffset={8}>
      This is a tooltip
    </TooltipContent>
  </Tooltip>
);

export const Bottom = () => (
  <Tooltip open={true}>
    <TooltipTrigger asChild>
      <Button variant='secondary'>Ignore me</Button>
    </TooltipTrigger>
    <TooltipContent side='bottom' sideOffset={8}>
      This is a tooltip
    </TooltipContent>
  </Tooltip>
);

export const Left = () => (
  <Tooltip open={true}>
    <TooltipTrigger asChild>
      <Button variant='secondary'>Ignore me</Button>
    </TooltipTrigger>
    <TooltipContent side='left' sideOffset={8}>
      This is a tooltip
    </TooltipContent>
  </Tooltip>
);

export const Permanent = () => (
  <Tooltip open={true}>
    <TooltipTrigger asChild>
      <Button variant='secondary'>Ignore me</Button>
    </TooltipTrigger>
    <TooltipContent side='right' sideOffset={8}>
      This is a tooltip
    </TooltipContent>
  </Tooltip>
);

export const Hover = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent side='right' sideOffset={8}>
      This is a tooltip
    </TooltipContent>
  </Tooltip>
);
