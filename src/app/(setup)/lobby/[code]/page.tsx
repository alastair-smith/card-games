"use client";

import { useEffect, useState } from "react";
import { GameInfo } from "./game-info";
import { Players } from "./players";
import { login } from "@/app/api/auth/login/client";
import { toast } from "sonner";

export default function Lobby() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const loginHandler = async () => {
      const { data, error } = await login();

      if (error !== null) {
        console.error(error);
        toast.error(error);
      } else {
        setUser(data);
      }
    };

    void loginHandler();
  }, []);

  return (
    <div className="flex w-full flex-wrap gap-6">
      <h1 className="sr-only">Lobby</h1>
      <GameInfo className="flex-1" />
      <Players className="flex-1" />
    </div>
  );
}
