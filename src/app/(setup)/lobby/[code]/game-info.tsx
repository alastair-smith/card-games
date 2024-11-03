import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GameInfo({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Game Info</CardTitle>
      </CardHeader>
      <CardContent>Blah</CardContent>
    </Card>
  );
}
