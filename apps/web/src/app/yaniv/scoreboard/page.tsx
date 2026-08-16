'use client';

import Setup from './_components/setup';
import useYanivScoreboard from './useYanivScoreboard';

export default function YanivScoreboardPage() {
  const {} = useYanivScoreboard();

  return (
    <div>
      <h1>Yaniv</h1>
      <Setup players={[{ id: 'a', name: 'b' }]} setPlayers={() => {}} />
    </div>
  );
}
