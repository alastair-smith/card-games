#!/usr/bin/env node
import { z } from 'zod';
import { YAML } from 'zx';
import {
  $capture,
  exitIfFailed,
  exitWithError,
  exitWithUsage,
  fetchJson,
  isIssueNumber,
  parseArguments,
  REPO_FULL_NAME,
} from '../../lib/script-helpers.ts';

const usage =
  'Usage: fetch-release-notes.ts <PR number> [--package <name>]\n' +
  'Without --package, lists the direct dependencies the PR bumps.\n' +
  "With --package, prints that package's release notes for every version it bumps through.";

const { positionals, values } = parseArguments(usage, {
  options: { package: { type: 'string' } },
  allowPositionals: true,
});

const [pullRequestNumber, ...extraArguments] = positionals;
if (!isIssueNumber(pullRequestNumber) || extraArguments.length > 0) {
  exitWithUsage(usage);
}

// npm's rules for package names, scoped or not
const PACKAGE_NAME = /^(@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/;
const requestedPackage = values.package;
if (requestedPackage !== undefined && !PACKAGE_NAME.test(requestedPackage)) {
  exitWithError(`'${requestedPackage}' isn't a valid package name.`);
}

const GITHUB_REPO = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;
const RELEASE_VERSION = /^(\d+)\.(\d+)\.(\d+)$/;
const MAX_RELEASE_PAGES = 10;

const pullRequest = await fetchJson(
  z.object({ headRefOid: z.string(), baseRefName: z.string() }),
  $capture`gh pr view ${pullRequestNumber} --repo ${REPO_FULL_NAME} --json headRefOid,baseRefName`,
);
if (pullRequest.baseRefName !== 'main') {
  exitWithError(
    `PR #${pullRequestNumber} targets ${pullRequest.baseRefName}, not main.`,
  );
}

const lockfileSchema = z.object({
  importers: z.record(
    z.string(),
    z.object({
      dependencies: z
        .record(z.string(), z.object({ version: z.string() }))
        .optional(),
      devDependencies: z
        .record(z.string(), z.object({ version: z.string() }))
        .optional(),
    }),
  ),
});

/** Each direct dependency's resolved version, by importer and package name. */
async function readLockfile(ref: string): Promise<Map<string, string>> {
  const result =
    await $capture`gh api ${`repos/${REPO_FULL_NAME}/contents/pnpm-lock.yaml?ref=${ref}`} -H ${'Accept: application/vnd.github.raw'}`;
  exitIfFailed(result);
  // pnpm writes several YAML documents, the first for pnpm itself; the
  // project's is the one whose importers list dependencies
  const documents = YAML.parseAllDocuments(result.stdout);
  const lockfile = (Array.isArray(documents) ? documents : [documents])
    .map((document) => lockfileSchema.safeParse(document.toJS()))
    .flatMap((parsed) => (parsed.success ? [parsed.data] : []))
    .find((document) =>
      Object.values(document.importers).some(
        (importer) => importer.dependencies ?? importer.devDependencies,
      ),
    );
  if (lockfile === undefined) {
    exitWithError(`The lockfile at ${ref} lists no dependencies.`);
  }

  const versions = new Map<string, string>();
  for (const [importer, dependencyGroups] of Object.entries(
    lockfile.importers,
  )) {
    for (const group of [
      dependencyGroups.dependencies,
      dependencyGroups.devDependencies,
    ]) {
      for (const [name, { version }] of Object.entries(group ?? {})) {
        // Drop pnpm's peer suffix, e.g. 16.4.6(@babel/core@7.29.7)
        versions.set(`${importer}\t${name}`, version.split('(')[0] ?? version);
      }
    }
  }
  return versions;
}

// Compared with where the PR branched from main on GitHub, rather than with
// main or the local checkout, so bumps already on main aren't counted as the
// PR's, and a merged PR still shows its own
const comparison = await fetchJson(
  z.object({ merge_base_commit: z.object({ sha: z.string() }) }),
  $capture`gh api ${`repos/${REPO_FULL_NAME}/compare/main...${pullRequest.headRefOid}`} --jq ${'{merge_base_commit: {sha: .merge_base_commit.sha}}'}`,
);

const [mainVersions, pullRequestVersions] = await Promise.all([
  readLockfile(comparison.merge_base_commit.sha),
  readLockfile(pullRequest.headRefOid),
]);

type Bump = { name: string; from: string; to: string; importers: string[] };

const bumpsByKey = new Map<string, Bump>();
for (const [key, to] of pullRequestVersions) {
  const from = mainVersions.get(key);
  if (from === undefined || from === to) continue;
  const [importer = '', name = ''] = key.split('\t');
  const bumpKey = `${name}\t${from}\t${to}`;
  const bump = bumpsByKey.get(bumpKey) ?? { name, from, to, importers: [] };
  bump.importers.push(importer === '.' ? 'root' : importer);
  bumpsByKey.set(bumpKey, bump);
}
const bumps = [...bumpsByKey.values()].sort((first, second) =>
  first.name.localeCompare(second.name),
);

const registrySchema = z.object({
  repository: z
    .union([
      z.string(),
      z.object({ url: z.string(), directory: z.string().optional() }),
    ])
    .optional(),
  versions: z.record(z.string(), z.unknown()),
  time: z.record(z.string(), z.string()),
});

type RegistryEntry = z.infer<typeof registrySchema>;

async function fetchRegistryEntry(name: string): Promise<RegistryEntry> {
  const response = await fetch(
    `https://registry.npmjs.org/${name.replace('/', '%2f')}`,
  );
  if (!response.ok) {
    exitWithError(`npm returned ${response.status} for ${name}.`);
  }
  return registrySchema.parse(await response.json());
}

function githubRepo(entry: RegistryEntry): string | undefined {
  const url =
    typeof entry.repository === 'string'
      ? entry.repository
      : entry.repository?.url;
  const match = url?.match(
    /github\.com[/:]([^/]+\/[^/#]+?)(?:\.git)?(?:[/#]|$)/,
  );
  const repo = match?.[1];
  return repo !== undefined && GITHUB_REPO.test(repo) ? repo : undefined;
}

function parseVersion(version: string): [number, number, number] | undefined {
  const match = version.match(RELEASE_VERSION);
  if (!match) return undefined;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareVersions(first: string, second: string): number {
  const firstParts = parseVersion(first) ?? [0, 0, 0];
  const secondParts = parseVersion(second) ?? [0, 0, 0];
  for (const index of [0, 1, 2] as const) {
    const difference = firstParts[index] - secondParts[index];
    if (difference !== 0) return difference;
  }
  return 0;
}

if (requestedPackage === undefined) {
  if (bumps.length === 0) {
    console.log(`PR #${pullRequestNumber} bumps no direct dependencies.`);
    process.exit(0);
  }

  console.log(
    `PR #${pullRequestNumber} bumps ${bumps.length} direct dependencies, compared with where it branched from main:\n`,
  );
  for (const bump of bumps) {
    const repo = githubRepo(await fetchRegistryEntry(bump.name));
    console.log(
      `${bump.name} ${bump.from} → ${bump.to} (${bump.importers.join(', ')}) ${repo ? `github.com/${repo}` : 'no GitHub repo on npm'}`,
    );
  }
  process.exit(0);
}

const bump = bumps.find((candidate) => candidate.name === requestedPackage);
if (bump === undefined) {
  exitWithError(
    `PR #${pullRequestNumber} doesn't bump ${requestedPackage} as a direct dependency.`,
  );
}

const entry = await fetchRegistryEntry(bump.name);
const repo = githubRepo(entry);
const versionsInRange = Object.keys(entry.versions)
  .filter(
    (version) =>
      parseVersion(version) !== undefined &&
      compareVersions(version, bump.from) > 0 &&
      compareVersions(version, bump.to) <= 0,
  )
  .sort(compareVersions);

console.log(
  `# ${bump.name} ${bump.from} → ${bump.to}: ${versionsInRange.length} versions (${versionsInRange.join(', ')})\n`,
);

if (repo === undefined) {
  console.log(
    'npm lists no GitHub repo for this package, so read its changelog on its npm page or homepage.',
  );
  process.exit(0);
}

const releaseSchema = z.object({
  tag_name: z.string(),
  body: z.string().nullable(),
  published_at: z.string().nullable(),
});

type Release = z.infer<typeof releaseSchema>;

const fromPublishedAt = entry.time[bump.from] ?? '';
const releases: Release[] = [];
for (let page = 1; page <= MAX_RELEASE_PAGES; page++) {
  const pageOfReleases = await fetchJson(
    z.array(releaseSchema),
    $capture`gh api ${`repos/${repo}/releases?per_page=100&page=${page}`}`,
  );
  releases.push(...pageOfReleases);
  const oldest = pageOfReleases.at(-1)?.published_at ?? '';
  if (pageOfReleases.length < 100 || oldest < fromPublishedAt) break;
}

const packageName = bump.name;
const unscopedName = packageName.replace(/^@[^/]+\//, '');

/** The release for `version`, preferring a monorepo tag that names the package. */
function findRelease(version: string): Release | undefined {
  const endsWithVersion = new RegExp(
    `(^|[^0-9.])${version.replaceAll('.', '\\.')}$`,
  );
  const candidates = releases.filter((release) =>
    endsWithVersion.test(release.tag_name),
  );
  return (
    candidates.find((release) => release.tag_name.includes(packageName)) ??
    candidates.find((release) => release.tag_name.includes(unscopedName)) ??
    (candidates.length === 1 ? candidates[0] : undefined)
  );
}

const versionsWithoutNotes: string[] = [];
for (const version of [...versionsInRange].reverse()) {
  const release = findRelease(version);
  const body = release?.body?.trim() ?? '';
  // Some repos, such as Vue, publish releases that only point to CHANGELOG.md
  if (release === undefined || (/changelog/i.test(body) && body.length < 300)) {
    versionsWithoutNotes.push(version);
  }
  if (release !== undefined && body) {
    console.log(`## ${release.tag_name}\n${body}\n`);
  }
}

if (versionsWithoutNotes.length > 0) {
  console.log(
    `No full GitHub release notes for ${versionsWithoutNotes.join(', ')}. Read their entries in github.com/${repo}'s CHANGELOG.md.`,
  );
}
