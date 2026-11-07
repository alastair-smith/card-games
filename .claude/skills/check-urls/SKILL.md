---

name: check-urls
description: Check that links to our own sites (playcards.games and its subdomains) or github.com resolve, and read their status, redirects, headers, anchors and markdown support, without curl. Use when checking links in docs, a PR or a page, or a claim about a response header. Read third-party docs with Claude Code's web fetch instead.
---

# Check URLs

Use this rather than `curl` for playcards.games, its subdomains such as
docs.playcards.games and stories.playcards.games, and github.com:

```bash
./.claude/skills/check-urls/scripts/check-urls.ts --url https://docs.playcards.games/technical/testing-strategy#story-tests
./.claude/skills/check-urls/scripts/check-urls.ts --url https://github.com/alastair-smith/card-games --header x-frame-options
```

Pass `--url` once per URL, so one call checks every link in a change, and
`--header` once per header to show. For each URL it prints:

- **status:** the HTTP status of the last response
- **final address:** where redirects led, and whether there were any
- **each `--header`:** its value, or `not set`
- **`#fragment`:** for a URL with one, whether the page has an element with
  that `id` or `name`
- **markdown:** whether the page is served as markdown when asked with
  `Accept: text/markdown`

It never prints the page itself. It exits with 1 if any URL isn't a 2xx or
its fragment isn't found, and rejects other hosts, `http` URLs and URLs with
credentials. Redirects that leave the list stop the check.

## Third-party docs

Read a library's or service's docs, such as storybook.js.org, with Claude
Code's web fetch rather than curl or this script. The docs sites in
`.claude/settings.json` fetch without a prompt. Fetching checks that a link
resolves too, and shows what the page says.
