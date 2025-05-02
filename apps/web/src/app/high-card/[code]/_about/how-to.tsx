import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/utils/cn"

function HowToContent() {
  return (
    <div className="flex flex-col gap-2">
      <p>High Card is a fast and simple luck-based game for 2-8 players.</p>
      <p>Each player is dealt a random card at the start of the game and then they take it in turns to flip them over by clicking on their card. Once every player has revealed their cards then the player(s) with the highest card wins!</p>
      <p>Aces are high, and players can tie for first!</p>
    </div>
  )
}

export function HowToSection({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader><h2 className="text-xl font-semibold">How to play High Card</h2></CardHeader>
      <CardContent>
        <HowToContent />
      </CardContent>
    </Card>
  )
}

export function HowToModal() {
  return (
    <div>
      <HowToContent />
    </div>
  )
}
