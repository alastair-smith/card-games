import type { Meta, StoryObj } from '@storybook/nextjs-vite';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '.';

const items = [
  {
    value: 'item-1',
    question: 'Is it accessible?',
    answer: 'Yes. It adheres to the WAI-ARIA design pattern.',
  },
  {
    value: 'item-2',
    question: 'Is it styled?',
    answer:
      "Yes. It comes with default styles that matches the other components' aesthetic.",
  },
  {
    value: 'item-3',
    question: 'Is it animated?',
    answer:
      "Yes. It's animated by default, but you can disable it if you prefer.",
  },
];

const accordionItems = items.map((item) => (
  <AccordionItem key={item.value} value={item.value}>
    <AccordionTrigger>{item.question}</AccordionTrigger>
    <AccordionContent>{item.answer}</AccordionContent>
  </AccordionItem>
));

type AccordionStoryProps = {
  type: 'single' | 'multiple';
  className?: string;
};

const meta: Meta<AccordionStoryProps> = {
  title: 'UI Components / Accordion',
  component: Accordion,
  args: {
    type: 'single',
    className: 'w-96',
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['single', 'multiple'] },
  },
  render: ({ type, className }) =>
    type === 'single' ? (
      <Accordion type='single' collapsible className={className}>
        {accordionItems}
      </Accordion>
    ) : (
      <Accordion type='multiple' className={className}>
        {accordionItems}
      </Accordion>
    ),
};

export default meta;

type Story = StoryObj<AccordionStoryProps>;

export const Default: Story = {};

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card>
      <CardHeader className='text-2xl font-medium'>Accordion</CardHeader>
      <CardContent>
        <p>
          A vertically stacked set of interactive headings that each reveal a
          section of content.
        </p>
        <Table className='w-fit'>
          <TableCaption>Variations of the Accordion component</TableCaption>
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
                <Accordion type='single' collapsible className='w-96'>
                  {accordionItems}
                </Accordion>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Multiple</TableCell>
              <TableCell>
                <Accordion type='multiple' className='w-96'>
                  {accordionItems}
                </Accordion>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  ),
};

export const Multiple: Story = { args: { type: 'multiple' } };
