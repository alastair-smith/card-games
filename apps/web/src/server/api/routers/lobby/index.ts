import { createTRPCRouter } from "@/server/api/trpc";
import { create } from "./create";
import { getSummary } from "./get-summary";
import { updatePlayer } from "./update-player";

export const lobbyRouter = createTRPCRouter({
  create,
  getSummary,
  updatePlayer,
});
