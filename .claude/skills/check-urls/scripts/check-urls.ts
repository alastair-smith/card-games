#!/usr/bin/env node
import {
  DEV_SERVERS,
  escapeRegExp,
  exitWithError,
  exitWithUsage,
  isDevServerPort,
  parseArguments,
} from '../../lib/script-helpers.ts';

const usage =
  'Usage: check-urls.ts --url <url> [--url <url> …] [--header <name> …]';

// Third-party docs are read with Claude Code's web fetch instead, and our
// GitHub issues and PRs with gh
const ALLOWED_HOSTS = ['playcards.games'] as const;

const STORYBOOK_HOST = 'stories.playcards.games';
const STORYBOOK_DEV_PORT = '6006';
const DOCS_DEV_PORT = '5173';

const isDevServer = (url: URL) =>
  url.protocol === 'http:' &&
  url.hostname === 'localhost' &&
  isDevServerPort(url.port);

// Storybook, hosted or not, and VitePress's dev server send an empty page and
// render it in the browser, so there's no id to find
const isBrowserRendered = (url: URL) =>
  url.hostname === STORYBOOK_HOST ||
  url.hostname.endsWith(`.${STORYBOOK_HOST}`) ||
  (isDevServer(url) &&
    (url.port === STORYBOOK_DEV_PORT || url.port === DOCS_DEV_PORT));

function decodeFragment(hash: string): string | undefined {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return undefined;
  }
}

const HEADER_NAME = /^[A-Za-z0-9-]+$/;
const MAX_REDIRECTS = 10;
const REQUEST_TIMEOUT_MILLISECONDS = 15_000;

const { url: urls = [], header: headerNames = [] } = parseArguments(usage, {
  options: {
    url: { type: 'string', multiple: true },
    header: { type: 'string', multiple: true },
  },
}).values;

if (urls.length === 0) {
  exitWithUsage(usage);
}

for (const headerName of headerNames) {
  if (!HEADER_NAME.test(headerName)) {
    exitWithError(
      `--header must be a header name such as 'x-frame-options', not '${headerName}'.`,
    );
  }
}

// A subdomain counts, e.g. docs.playcards.games or a pr-123 preview
const isAllowedHost = (host: string) =>
  ALLOWED_HOSTS.some(
    (allowedHost) => host === allowedHost || host.endsWith(`.${allowedHost}`),
  );

function parseAllowedUrl(value: string, option: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    exitWithError(`${option} must be a full URL, not '${value}'.`);
  }
  if (url.username || url.password) {
    exitWithError(`${option} must have no credentials, not '${value}'.`);
  }
  if (isDevServer(url)) {
    return url;
  }
  if (url.protocol !== 'https:') {
    exitWithError(
      `${option} must be https, or http://localhost on port ${Object.keys(DEV_SERVERS).join(', ')}, not '${value}'.`,
    );
  }
  if (!isAllowedHost(url.hostname)) {
    exitWithError(
      `${url.hostname} isn't on the list of hosts this script checks: ${ALLOWED_HOSTS.join(', ')}.`,
    );
  }
  return url;
}

const requestedUrls = urls.map((value) => parseAllowedUrl(value, '--url'));

// Follows redirects one hop at a time, so none can lead off the list
async function fetchFollowingRedirects(url: URL, accept: string) {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let response: Response;
    try {
      response = await fetch(current, {
        redirect: 'manual',
        headers: { accept },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
      });
    } catch {
      exitWithError(
        isDevServer(current)
          ? `Couldn't reach ${current.origin}. Start it with the dev-servers skill.`
          : `Couldn't reach ${current.origin}.`,
      );
    }
    const location = response.headers.get('location');
    if (response.status < 300 || response.status >= 400 || !location) {
      return { response, finalUrl: current };
    }
    await response.body?.cancel();
    current = parseAllowedUrl(
      new URL(location, current).href,
      `The redirect from ${current.href}`,
    );
  }
  exitWithError(`${url.href} redirected more than ${MAX_REDIRECTS} times.`);
}

let hasFailure = false;

for (const url of requestedUrls) {
  const fragment = decodeFragment(url.hash);
  const { response, finalUrl } = await fetchFollowingRedirects(
    url,
    'text/html',
  );

  const lines = [`  status: ${response.status}`];
  const isRedirected = finalUrl.href !== url.href;
  lines.push(
    `  final address: ${finalUrl.href}${isRedirected ? ' (redirected)' : ' (no redirect)'}`,
  );
  for (const headerName of headerNames) {
    lines.push(
      `  ${headerName.toLowerCase()}: ${response.headers.get(headerName) ?? 'not set'}`,
    );
  }

  if (fragment === undefined) {
    await response.body?.cancel();
    lines.push(`  ${url.hash}: not a valid fragment`);
    hasFailure = true;
  } else if (fragment && isBrowserRendered(finalUrl)) {
    await response.body?.cancel();
    lines.push(
      `  #${fragment}: not checked, as this page renders in the browser`,
    );
  } else if (fragment) {
    // Read only to look for the fragment's target, never printed. That's an
    // element's id, or an anchor's name, not a meta or form field's name
    const html = await response.text();
    const value = `["']?${escapeRegExp(fragment)}["'\\s>]`;
    const targetPattern = new RegExp(
      `\\sid=${value}|<a\\s[^>]*\\bname=${value}`,
      'i',
    );
    const isFound = targetPattern.test(html);
    lines.push(`  #${fragment}: ${isFound ? 'found' : 'not found'}`);
    if (!isFound) hasFailure = true;
  } else {
    await response.body?.cancel();
  }

  const markdown = await fetchFollowingRedirects(finalUrl, 'text/markdown');
  await markdown.response.body?.cancel();
  const isMarkdown =
    markdown.response.ok &&
    (markdown.response.headers.get('content-type') ?? '').startsWith(
      'text/markdown',
    );
  lines.push(`  markdown: ${isMarkdown ? 'yes' : 'no'}`);

  if (!response.ok) hasFailure = true;

  console.log(`${url.href}\n${lines.join('\n')}`);
}

process.exit(hasFailure ? 1 : 0);
