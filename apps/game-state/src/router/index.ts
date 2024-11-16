import { lobbyRoutes } from "./lobby/index.js";
import { flattenRoutes } from "./procedure.js";

export const router = flattenRoutes({
  lobby: lobbyRoutes
})