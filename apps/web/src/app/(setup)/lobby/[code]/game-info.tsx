import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { useState } from "react";

export function GameInfo({ className }: { className?: string }) {
  const [messages, setMessages] = useState<string[]>([]);
  api.lobby.subscribe.useSubscription({code: 'ABCDEDF'}, {onData: (data) => {
    setMessages([...messages, data])
  }})
  const mutation = api.lobby.post.useMutation();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Game Info</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => mutation.mutate({data: 'hello'})}>
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
