import { connection } from 'next/server';
import { PageHeader, PageRoot } from '~/components/layout/page';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '~/components/ui/card';
import { CopyToClipboard } from './_components/copy-to-clipboard';

const CONTACT_EMAIL = 'contact@playcards.games';

export default async function Contact() {
  await connection();

  return (
    <PageRoot>
      <PageHeader
        breadcrumbs={[
          { text: 'PlayCards.Games', href: '/' },
          { text: 'Contact' },
        ]}
      />

      <main className='flex-1 w-full flex flex-col justify-start items-center pt-[10vh]'>
        <Card className='max-w-3xl'>
          <CardHeader>Contact Us</CardHeader>

          <CardContent className='flex flex-col gap-3'>
            <CardDescription>
              Suggestions, feedback, encountering issues?
            </CardDescription>
            <p>
              The best way to get in touch is via email:{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className='cursor-pointer underline ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 rounded'
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
            <p>
              If you are reporting an issue it would be really helpful if you
              can include a screenshot along with details of the problem.
            </p>
            <div className='flex w-fit gap-3'></div>
          </CardContent>

          <CardFooter className='sm:justify-end gap-3 flex-col sm:flex-row'>
            <CopyToClipboard value={CONTACT_EMAIL} className='sm:w-auto w-full'>
              Copy Email To Clipboard
            </CopyToClipboard>
            <Button asChild className='sm:w-auto w-full'>
              <a href='mailto:contact@playcards.games'>Open Email Client</a>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </PageRoot>
  );
}
