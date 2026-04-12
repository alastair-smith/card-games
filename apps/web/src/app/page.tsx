import { connection } from 'next/server';
import { PageHeader, PageRoot } from '~/components/layout/page';
import { About } from './_components/about';
import { JoinGame } from './_components/join-game';
import { NewGame } from './_components/new-game';
import { TelemetryToggle } from './_components/telemetry-toggle';

export default async function Home() {
  await connection();

  return (
    <PageRoot className='pb-8'>
      <PageHeader breadcrumbs={[{ text: 'PlayCards.Games' }]} />

      <main className='flex-1 w-full flex flex-col gap-6'>
        <div className='flex w-full flex-wrap gap-6'>
          <About className='shrink-0 grow-2 basis-0' />
          <JoinGame className='shrink grow basis-0' />
        </div>

        <NewGame />

        <TelemetryToggle />
      </main>
    </PageRoot>
  );
}
