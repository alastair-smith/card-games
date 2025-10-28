import { Card, CardContent, CardHeader } from '~/components/ui/card';

export function HowToContent() {
  return (
    <div className='flex flex-col gap-2 text-left'>
      <p>High Card is a fast and simple luck-based game for 2-10 players.</p>
      <p>
        Each player is dealt a random card at the start of the game and then
        they take it in turns to flip them over by clicking on their card. Once
        every player has revealed their cards then the player(s) with the
        highest card wins!
      </p>
      <p>Aces are high, and players can tie for first!</p>
    </div>
  );
}

export function HowToSection({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <h2 className='text-xl font-semibold'>How to play High Card</h2>
      </CardHeader>
      <CardContent>
        <HowToContent />
      </CardContent>
    </Card>
  );
}
