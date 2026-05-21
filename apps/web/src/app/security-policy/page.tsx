import { connection } from 'next/server';
import { PageHeader, PageRoot } from '~/components/layout/page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '~/components/ui/card';
import { Link } from '~/components/ui/link';

const SECURITY_EMAIL = 'security@playcards.games';

export default async function SecurityPolicy() {
  await connection();

  return (
    <PageRoot>
      <PageHeader
        breadcrumbs={[
          { text: 'PlayCards.Games', href: '/' },
          { text: 'Security Policy' },
        ]}
      />

      <main className='flex-1 w-full flex flex-col justify-start items-center pt-[10vh]'>
        <Card className='max-w-3xl'>
          <CardHeader>Security Policy</CardHeader>

          <CardContent className='flex flex-col gap-3'>
            <CardDescription>
              Responsible disclosure of security vulnerabilities
            </CardDescription>
            <p>
              If you believe you have found a security vulnerability, please
              report it to us via email:{' '}
              <Link href={`mailto:${SECURITY_EMAIL}`}>{SECURITY_EMAIL}</Link>.
            </p>
            <p>
              Please include a description of the vulnerability along with steps
              to reproduce it. We will respond as soon as possible.
            </p>
          </CardContent>
        </Card>
      </main>
    </PageRoot>
  );
}
