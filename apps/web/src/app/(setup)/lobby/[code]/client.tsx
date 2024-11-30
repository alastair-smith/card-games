"use client";

import { useEffect, useState } from "react";
import { GameInfo } from "./game-info";
import { Players } from "./players";
import { login } from "@/app/api/auth/login/client";
import { toast } from "sonner";

export default function LobbyClient({ joinCode }: { joinCode: string }) {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const loginHandler = async () => {
      const { error, data } = await login();

      if (error !== null) {
        console.error(error);
        toast.error(error);
      } else {
        setUserId(data.id);
      }
    };

    void loginHandler();
  }, []);

  return userId ? (
    <div className="flex w-full flex-wrap gap-6">
      <h1 className="sr-only">Lobby</h1>
      <GameInfo className="flex-1" gameCode={joinCode} />
      <Players className="flex-1" gameCode={joinCode} userId={userId} />
    </div>
  ) : (
    <div>Loading...</div>
  );
}
