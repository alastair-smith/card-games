import { getLobbyHandlers } from './lobby';
import { getYanivHandlers } from './yaniv';

export const handlers = [...getLobbyHandlers(), ...getYanivHandlers()];
