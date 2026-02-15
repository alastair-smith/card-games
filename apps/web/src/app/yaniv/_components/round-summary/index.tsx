import { Card } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import type { PlayerName, UserId } from '~/types/entities';

type RoundSummaryProps = {
  /** Sorted by points scored */
  players: {
    id: UserId;
    name: PlayerName;
    score: number;
  }[];
};

export function RoundSummary({ players }: RoundSummaryProps) {
  return (
    <Card className='w-fit bg-alt-background text-dark-text min-w-80'>
      <Table>
        <TableCaption className='text-dark-text-disabled'>
          Round Summary
        </TableCaption>

        <TableHeader className='font-semibold'>
          <TableRow>
            <TableCell className='text-right py-2 md:py-4'>Player</TableCell>
            <TableCell className='py-2 md:py-4'>Hand score</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className='text-right py-2 md:py-4'>
                {player.name}
              </TableCell>
              <TableCell className='py-2 md:py-4'>{player.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
