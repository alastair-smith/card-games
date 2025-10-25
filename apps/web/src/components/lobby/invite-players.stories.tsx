import type { GameCode } from '~/types/game';
import InvitePlayersComponent from './invite-players';

const code = '123456' as GameCode;

export const InvitePlayers = () => <InvitePlayersComponent code={code} />;
