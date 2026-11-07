#!/usr/bin/env node
import {
  exitWithError,
  exitWithUsage,
  parseArguments,
} from '../../lib/script-helpers.ts';

const usage =
  'Usage: check-urls.ts --url <url> [--url <url> …] [--header <name> …]';

// Third-party docs are read with Claude Code's web fetch instead
const ALLOWED_HOSTS = ['playcards.games', 'github.com'] as const;

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
  if (url.protocol !== 'https:' || url.username || url.password) {
    exitWithError(
      `${option} must be an https URL with no credentials, not '${value}'.`,
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
    const response = await fetch(current, {
      redirect: 'manual',
      headers: { accept },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
    });
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

const escapeForPattern = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let hasFailure = false;

for (const url of requestedUrls) {
  const fragment = decodeURIComponent(url.hash.slice(1));
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

  if (fragment) {
    // Read only to look for the fragment's id, never printed
    const html = await response.text();
    const idPattern = new RegExp(
      `\\s(id|name)=["']?${escapeForPattern(fragment)}["'\\s>]`,
    );
    const isFound = idPattern.test(html);
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
