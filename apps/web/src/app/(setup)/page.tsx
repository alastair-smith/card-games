import { Header, Page } from '~/components/layout/page';
import { About } from './about';
import { JoinGame } from './join-game';
import { NewGame } from './new-game';

export default async function Home() {
  return (
    <Page className='pb-8'>
      <Header breadcrumbs={[{ text: 'PlayCards.Games' }]} />

      <main className='flex-1 w-full flex flex-col gap-6'>
        <div className='flex w-full flex-wrap gap-6'>
          <About className='flex-shrink-0 flex-grow-[2] basis-0' />
          <JoinGame className='flex-shrink flex-grow basis-0' />
        </div>

        <NewGame />
      </main>
    </Page>
  );
}
