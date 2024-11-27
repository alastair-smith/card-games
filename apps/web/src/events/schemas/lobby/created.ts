import { GAME_TYPE, GAME_TYPES, GameType } from "@/constants";
import { createEnumFromObject } from "@/utils/shared-schemas/enum";
import { joinCodeSchema } from "@/utils/shared-schemas/join-code";
import { z } from "zod";

const lobbyCreatedSchema = z.object({
  id: joinCodeSchema,
  hostUserId: z.string(),
  gameType: createEnumFromObject(GAME_TYPE),
});