---

name: check-urls
description: Check that links to our own sites (playcards.games and its subdomains, or the local dev servers) resolve, and read their status, redirects, headers, anchors and markdown support, without curl. Use when checking links in docs, a PR or a page, or a claim about a response header. Read third-party docs with Claude Code's web fetch instead, and check links to our GitHub repo against the repo or with gh.
---

# Check URLs

Use this rather than `curl` for playcards.games, its subdomains such as
docs.playcards.games and stories.playcards.games, and the dev servers on
localhost (ports 3000, 6006 and 5173), for pages that aren't deployed yet:

```bash
./.claude/skills/check-urls/scripts/check-urls.ts --url https://docs.playcards.games/technical/testing-strategy#story-tests
./.claude/skills/check-urls/scripts/check-urls.ts --url https://stories.playcards.games --header x-frame-options
./.claude/skills/check-urls/scripts/check-urls.ts --url http://localhost:5173/technical/new-page
```

Start a dev server first with the `dev-servers` skill.

Pass `--url` once per URL, so one call checks every link in a change, and
`--header` once per header to show. For each URL it prints:

- **status:** the HTTP status of the last response
- **final address:** where redirects led, and whether there were any
- **each `--header`:** its value, or `not set`
- **`#fragment`:** for a URL with one, whether the page has an element with
  that `id` or `name`. The docs site's and Storybook's dev servers render
  pages in the browser, so it can't check fragments there; check those
  against the deployed site
- **markdown:** whether the page is served as markdown when asked with
  `Accept: text/markdown`

It never prints the page itself. It exits with 1 if any URL isn't a 2xx or
its fragment isn't found, and rejects other hosts, `http` URLs other than the
dev servers, and URLs with credentials. Redirects that leave the list stop the check.

## Other links

- **Third-party docs**, such as storybook.js.org: read them with Claude Code's
  web fetch rather than curl. The docs sites in `.claude/settings.json` fetch
  without a prompt, and fetching shows that a link resolves as well as what
  the page says
- **Files in our GitHub repo** (`…/blob/main/<path>`): check the file exists
  in the repo. A file the same PR adds only resolves on GitHub once it merges
- **Our issues and PRs:** `gh issue view` and `gh pr view`
