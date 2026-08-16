'use client';

import { Button } from '~/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel';
import type { PlayerName } from '~/types/entities';
import useYanivScoreboard from '../../_hooks/useYanivScoreboard';
import SavedGame from '../saved-game';
import Setup from '../setup';

export default function Game() {
  const {
    scoreboardState,
    hasSavedGame,
    continueGame,
    startNewGame,
    startNewGameWithSamePlayers,
    updatePlayerName,
    reorderPlayers,
    addPlayer,
    removePlayer,
  } = useYanivScoreboard();

  if (hasSavedGame) {
    return (
      <SavedGame
        onContinue={continueGame}
        onStartNew={startNewGame}
        onStartNewWithSamePlayers={startNewGameWithSamePlayers}
      />
    );
  }

  return (
    <div>
      <h1>Yaniv</h1>

      <Carousel className='w-full max-w-xs'>
        <CarouselContent>
          <CarouselItem>
            <Setup
              players={scoreboardState.players}
              updatePlayerName={updatePlayerName}
              reorderPlayers={reorderPlayers}
              removePlayer={removePlayer}
            />
          </CarouselItem>

          {/*{rounds.map((round) => (
            <CarouselItem key={round.id}>

            </CarouselItem>*/}
          {/*))}*/}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <Button onClick={() => addPlayer('' as PlayerName)}>Add Player</Button>
    </div>
  );
}
