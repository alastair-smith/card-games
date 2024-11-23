import { schema, EVENT_NAME } from "./schema"
import { publisher } from "../../publishEvent";

export const lobbyChangelogPublisher = publisher(EVENT_NAME, schema);
