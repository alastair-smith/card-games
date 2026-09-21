import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentProps } from 'react';
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
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '.';

type BreadcrumbsStoryProps = ComponentProps<typeof Breadcrumb> & {
  isEllipsisShown: boolean;
};

const Trail = ({
  isEllipsisShown,
}: Pick<BreadcrumbsStoryProps, 'isEllipsisShown'>) => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href='#'>Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      {isEllipsisShown && (
        <>
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </>
      )}
      <BreadcrumbItem>
        <BreadcrumbLink href='#'>Components</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Breadcrumbs</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

const meta: Meta<BreadcrumbsStoryProps> = {
  title: 'UI Components /Breadcrumbs',
  component: Breadcrumb,
  args: {
    isEllipsisShown: false,
  },
  render: (args) => <Trail {...args} />,
};

export default meta;

type Story = StoryObj<BreadcrumbsStoryProps>;

export const Default: Story = {};

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card>
      <CardHeader className='text-2xl font-medium'>Breadcrumbs</CardHeader>
      <CardContent>
        <p>
          Breadcrumbs are used to show the user's location in a site's
          hierarchy.
        </p>
        <Table className='w-fit'>
          <TableCaption>Variations of the Breadcrumbs component</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Default</TableCell>
              <TableCell>
                <Trail isEllipsisShown={false} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>With Ellipsis</TableCell>
              <TableCell>
                <Trail isEllipsisShown={true} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  ),
};

export const WithEllipsis: Story = { args: { isEllipsisShown: true } };
