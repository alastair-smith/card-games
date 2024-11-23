import { schema, EVENT_NAME } from "./schema"
import { publishEvent } from "../../publishEvent";

export const publishLobbyChangelog = publishEvent(EVENT_NAME, schema);
