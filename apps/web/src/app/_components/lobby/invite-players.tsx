'use client';

import { GameCode } from "@/types/game";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "../ui/toast";
import { Card, CardHeader } from "../ui/card";

async function copyUrlToClipboard() {
  const { origin, pathname } = new URL(window.location.href);
  await navigator.clipboard.writeText(`${origin}${pathname}`);
  toast.success("Copied to clipboard.");
};

export default function InvitePlayers({ code }: { code: GameCode }) {
  return (
    <Card className='w-fit'>
      <CardHeader>
        <div className="flex gap-3">
          <Input
            placeholder="Code"
            className="h-20 min-w-60 max-w-80 text-center font-mono text-4xl uppercase"
            name="code"
            value={code}
            readOnly
          />
          <Button
            className="h-auto"
            onClick={() => {
              void copyUrlToClipboard();
            }}
          >
            Copy Link
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};