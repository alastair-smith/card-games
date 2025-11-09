import {
  PlayingCardDiscardPile,
  PlayingCardStack,
} from '~/components/ui/playing-card-stacks';

export function PlayArea() {
  return (
    <div>
      <PlayingCardDiscardPile></PlayingCardDiscardPile>
      <PlayingCardStack></PlayingCardStack>
    </div>
  );
}
