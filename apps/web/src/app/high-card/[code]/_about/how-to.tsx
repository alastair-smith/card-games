import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/utils/cn"

function HowToContent() {
  return (
    <div>
      <p>Lorem ipsum</p>
    </div>
  )
}

export function HowToSection({ className }: { className: string }) {
  return (
    <Card className={cn('max-w-reading', className)}>
      <CardHeader>How to play High Card</CardHeader>
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
