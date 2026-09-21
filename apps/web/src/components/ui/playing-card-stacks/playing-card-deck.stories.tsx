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
import { PlayingCardDeck } from '.';

const CARD_SIZES = [
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl',
  'text-6xl',
  'text-7xl',
  'text-8xl',
  'text-9xl',
] as `text-${string}`[];

const meta = {
  title: 'UI Components / Playing Card Deck',
  component: PlayingCardDeck,
  args: {
    className: 'text-4xl',
  },
  argTypes: {
    className: { control: 'select', options: CARD_SIZES },
  },
} satisfies Meta<typeof PlayingCardDeck>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultDeck: Story = {};

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Card>
        <CardHeader className='text-2xl font-medium'>Sizing</CardHeader>
        <CardContent>
          <Table className='w-fit bg-main-background text-dark-text'>
            <TableCaption>Different sizes of playing card decks</TableCaption>

            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Example Cards</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {CARD_SIZES.map((className) => (
                <TableRow key={className}>
                  <TableCell>
                    {className}
                    {className === 'text-4xl' ? ' (Default)' : ''}
                  </TableCell>
                  <TableCell className='flex gap-3'>
                    <PlayingCardDeck className={className} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  ),
};
