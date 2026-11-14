'use client';

import { useLobbyPlayer } from '~/components/lobby/use-lobby-player';
import type { GameCode, Player } from '~/types/game';
import ShitheadLobbyView from './lobby.view';

export default function Lobby({
  code,
  players,
}: {
  code: GameCode;
  players: Player[];
}) {
  const {
    user,
    handleNameChange,
    handleColorChange,
    handleReadyChange,
    handleLeave,
    handleKick,
    handleMakeHost,
  } = useLobbyPlayer({ code, players });

  // Starting the game is connected once the server can deal (#437, #438)
  const handleStartGame = () => {};

  return (
    <ShitheadLobbyView
      code={code}
      players={players}
      user={user}
      onNameChange={handleNameChange}
      onColorChange={handleColorChange}
      onReadyChange={handleReadyChange}
      onStartGame={handleStartGame}
      onLeave={handleLeave}
      onKick={handleKick}
      onMakeHost={handleMakeHost}
    />
  );
}
