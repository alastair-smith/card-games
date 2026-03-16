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
    roundScore: { original: number; adjusted: number };
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
          {players.map((player) => {
            const { original, adjusted } = player.roundScore;
            const scoreDisplay =
              original !== adjusted
                ? `${adjusted} (${original})`
                : String(adjusted);
            return (
              <TableRow key={player.id}>
                <TableCell className='text-right py-2 md:py-4'>
                  {player.name}
                </TableCell>
                <TableCell className='py-2 md:py-4'>{scoreDisplay}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
