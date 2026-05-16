import { connection } from 'next/server';
import { TelemetryToggle } from '~/app/_components/telemetry-toggle';
import { PageHeader, PageRoot } from '~/components/layout/page';
import {
  Article,
  ArticleContent,
  ArticleHeader,
  ArticleHeading,
  ArticleSubtitle,
  ArticleTitle,
} from '~/components/ui/article';
import { Link } from '~/components/ui/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

const CONTACT_EMAIL = 'contact@playcards.games';

function DottedCode({ name }: { name: string }) {
  const parts = name.split('.');
  return (
    <code>
      {parts.map((part, index) => (
        <span
          key={`${part}-${
            // biome-ignore lint/suspicious/noArrayIndexKey: could have duplicate parts
            index
          }`}
        >
          {index > 0 && '.'}
          <wbr />
          {part}
        </span>
      ))}
    </code>
  );
}

export default async function PrivacyPolicy() {
  await connection();

  return (
    <PageRoot>
      <PageHeader
        breadcrumbs={[
          { text: 'PlayCards.Games', href: '/' },
          { text: 'Privacy Policy' },
        ]}
      />

      <main className='flex-1 w-full flex flex-col justify-start items-center pb-6 sm:px-6'>
        <Article includeContents>
          <ArticleHeader>
            <ArticleTitle>Privacy Policy</ArticleTitle>
            <ArticleSubtitle>Last updated: 4 May 2026</ArticleSubtitle>
          </ArticleHeader>

          <ArticleContent>
            <ArticleHeading id='about'>About this policy</ArticleHeading>
            <p className='text-sm'>
              PlayCards.Games is operated by an individual, not a company. As
              the data controller under the UK General Data Protection
              Regulation (UK GDPR) and the Data Protection Act 2018, I am
              committed to handling your personal data responsibly and
              transparently.
            </p>
            <p className='text-sm'>
              For any questions about this policy, contact{' '}
              <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>.
            </p>

            <ArticleHeading id='analytics'>Analytics (optional)</ArticleHeading>
            <p className='text-sm'>
              You can opt in to sharing anonymised usage data to help improve
              the app. Use the toggle below, or find it on the home page under
              &ldquo;About&rdquo;.
            </p>
            <TelemetryToggle className='py-2' />
            <p className='text-sm'>
              If you opt in, usage data is processed by{' '}
              <strong>New Relic, Inc.</strong> who provide a platform to store
              this information and display it to this website's maintainers. It
              is not shared with any other parties. It is stored in their EU
              data centre in Frankfurt, Germany. See the{' '}
              <Link
                href='https://newrelic.com/termsandconditions/services-notices'
                target='_blank'
                rel='noopener noreferrer'
              >
                New Relic Services Privacy Notice
              </Link>{' '}
              for details on how they handle data as a processor.
            </p>
            <p className='text-sm'>
              If you opt in then the following fields may be sent for each
              action you take:
            </p>
            <Table className='sm:[&_td:first-child]:whitespace-nowrap'>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>What it contains</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <DottedCode name='http.request.method' />
                  </TableCell>
                  <TableCell>HTTP method (e.g. GET, POST)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <DottedCode name='http.response.status_code' />
                  </TableCell>
                  <TableCell>
                    HTTP response status code (e.g. 200, 500)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <DottedCode name='url.full' />
                  </TableCell>
                  <TableCell>
                    The API endpoint URL. This does not include identifying
                    fields like player names or IDs.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className='flex flex-col gap-1 sm:gap-0'>
                      <DottedCode name='server.address' />
                      <DottedCode name='server.port' />
                    </div>
                  </TableCell>
                  <TableCell>
                    Hostname and port of the server being called
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <DottedCode name='browser.brands' />
                  </TableCell>
                  <TableCell>
                    Browser name and major version only (e.g. Firefox 150)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <DottedCode name='browser.platform' />
                  </TableCell>
                  <TableCell>Operating system (e.g. Linux, Windows)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className='flex flex-col gap-1 sm:gap-0'>
                      <DottedCode name='browser.viewport.height' />
                      <DottedCode name='browser.viewport.width' />
                    </div>
                  </TableCell>
                  <TableCell>Browser window size in pixels</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className='flex flex-col gap-1 sm:gap-0'>
                      <DottedCode name='device.screen.height' />
                      <DottedCode name='device.screen.width' />
                    </div>
                  </TableCell>
                  <TableCell>Screen resolution in pixels</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <DottedCode name='service.version' />
                  </TableCell>
                  <TableCell>App version</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <DottedCode name='game.code' />
                  </TableCell>
                  <TableCell>
                    The short code used to join the game (e.g. DB3EHI)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <DottedCode name='game.player.id' />
                  </TableCell>
                  <TableCell>
                    A hash of the identifier for your player session. It is
                    derived using a per-game key so it cannot be used to
                    identify you or link your activity across games.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className='text-sm'>
              These fields have been chosen carefully to capture only what is
              needed to diagnose errors and for building aggregations to
              understand common user devices. In particular, only the major
              browser version is recorded (not the full version string), and no
              precise location or hardware identifiers are collected, in order
              to minimise the risk of users being fingerprinted.
            </p>
            <p className='text-sm'>
              You can withdraw consent from sending this telemetry information
              from your browser at any time using the toggle above or the one on
              the home page.
            </p>
            <p className='text-sm'>
              Separately, our servers generate their own anonymised technical
              traces as a normal part of running the service. These are produced
              on the server when it processes your game activity, not in your
              browser, and do not contain your player name or any directly
              identifiable information.
            </p>

            <ArticleHeading id='cookies'>Cookies</ArticleHeading>
            <p className='text-sm'>
              This site uses one cookie, which is strictly necessary for the
              service to function.
            </p>
            <Table className='sm:[&_td:first-child]:whitespace-nowrap'>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <code>__host-auth</code>
                  </TableCell>
                  <TableCell>
                    Identifies your browser session so you can join and play
                    games. Contains a randomly generated identifier only — no
                    personal information is stored inside this cookie.
                  </TableCell>
                  <TableCell>Strictly necessary</TableCell>
                  <TableCell>7 days</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <ArticleHeading id='game-session-data'>
              Game session data
            </ArticleHeading>
            <p className='text-sm'>
              When you join a game, your chosen player name and an identifier
              are stored temporarily to enable gameplay. This data is
              automatically and permanently deleted after 24 hours.
            </p>

            <ArticleHeading id='legal-basis'>
              Legal basis for processing
            </ArticleHeading>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Processing activity</TableHead>
                  <TableHead>Legal basis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Auth cookie</TableCell>
                  <TableCell>
                    Legitimate interests — necessary to operate the service
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Game session data</TableCell>
                  <TableCell>
                    Legitimate interests — necessary to run gameplay
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Analytics traces (opt-in)</TableCell>
                  <TableCell>Consent</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Server-side technical traces</TableCell>
                  <TableCell>
                    Legitimate interests — service operation and security
                    monitoring
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <ArticleHeading id='data-retention'>Data retention</ArticleHeading>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Retention period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Auth cookie</TableCell>
                  <TableCell>7 days (auto-renewed on use)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Game session data</TableCell>
                  <TableCell>24 hours from last activity</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Analytics traces (if opted in)</TableCell>
                  <TableCell>
                    Subject to New Relic&rsquo;s retention policy
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Server-side technical traces</TableCell>
                  <TableCell>As configured by the site operator</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <ArticleHeading id='your-rights'>Your rights</ArticleHeading>
            <p className='text-sm'>Under the UK GDPR you have the right to:</p>
            <ul className='text-sm list-disc pl-5 space-y-1'>
              <li>Access the personal data held about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Restrict or object to processing</li>
              <li>Data portability</li>
              <li>
                Withdraw consent for analytics at any time (via the toggle above
                or on the home page)
              </li>
            </ul>
            <p className='text-sm'>
              Because game session data is deleted within 24 hours and the auth
              cookie contains only a pseudonymised identifier, there is limited
              persistent personal data held about you. To exercise any of your
              rights, contact{' '}
              <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>.
            </p>

            <ArticleHeading id='changes'>Changes to this policy</ArticleHeading>
            <p className='text-sm'>
              This policy may be updated from time to time; the &ldquo;last
              updated&rdquo; date at the top of this page will always reflect
              the most recent version.
            </p>

            <ArticleHeading id='contact'>Contact and complaints</ArticleHeading>
            <p className='text-sm'>
              For any questions or concerns about how your data is handled,
              contact{' '}
              <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>.
            </p>
            <p className='text-sm'>
              If you are unhappy with how your data has been handled, you have
              the right to complain to the UK Information Commissioner&rsquo;s
              Office (ICO):
            </p>
            <ul className='text-sm list-disc pl-5 space-y-1'>
              <li>
                Website:{' '}
                <Link
                  href='https://ico.org.uk'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  ico.org.uk
                </Link>
              </li>
              <li>Phone: 0303 123 1113</li>
            </ul>
          </ArticleContent>
        </Article>
      </main>
    </PageRoot>
  );
}
