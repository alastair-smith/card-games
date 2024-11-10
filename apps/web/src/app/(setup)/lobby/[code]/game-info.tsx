import { useWebSocket } from "@/app/hooks/useWebsocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GameInfo({ className }: { className?: string }) {
  const { messages, sendMessage } = useWebSocket();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Game Info</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => sendMessage("hello from the client")}>
          Send
        </Button>
        <div>
          {messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
