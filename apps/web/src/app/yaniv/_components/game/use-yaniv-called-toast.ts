import { useEffect, useRef } from 'react';
import { toast } from '~/components/ui/toast';
import type { PlayerName, UserId } from '~/types/entities';

type Player = {
  id: UserId;
  name: PlayerName;
  isYanivCalled: boolean;
};

export function useYanivCalledToast(players: Player[]) {
  const isFirstRender = useRef(true);
  const previousYanivCalledRef = useRef<Map<UserId, boolean>>(new Map());

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousYanivCalledRef.current = new Map(
        players.map((player) => [player.id, player.isYanivCalled]),
      );
      return;
    }

    const previous = previousYanivCalledRef.current;

    for (const player of players) {
      const wasCalled = previous.get(player.id) ?? false;
      if (!wasCalled && player.isYanivCalled) {
        toast.info(`${player.name} has called Yaniv!`);
      }
    }

    previousYanivCalledRef.current = new Map(
      players.map((player) => [player.id, player.isYanivCalled]),
    );
  }, [players]);
}
