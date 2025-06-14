import { createTRPCRouter } from "@/server/api/trpc";
import { startGame } from "./start-game";
import { pickupCard } from "./pickup-card";
import { state } from "./state";

export const highCardRouter = createTRPCRouter({
  startGame,
  pickupCard,
  state,
});
