#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { z } from 'zod';
import { exitWithError, parseArguments } from '../../lib/script-helpers.ts';

const usage = 'Usage: list-llm-approvals.ts [--session <session id>]';

const SESSION_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const REJECTION_TEXT = "doesn't want to proceed";

const toolUseSchema = z.object({
  type: z.literal('tool_use'),
  id: z.string(),
  name: z.string(),
  input: z.record(z.string(), z.unknown()).optional(),
});

const toolResultSchema = z.object({
  type: z.literal('tool_result'),
  tool_use_id: z.string(),
  content: z.unknown(),
});

const recordSchema = z.object({
  message: z
    .object({ content: z.union([z.string(), z.array(z.unknown())]) })
    .optional(),
  permissionDecision: z.object({ source: z.string() }).optional(),
});

const { session } = parseArguments(usage, {
  options: { session: { type: 'string' } },
}).values;

if (session !== undefined && !SESSION_ID.test(session)) {
  exitWithError(`--session must be a session ID (a UUID), not '${session}'.`);
}

// Claude Code keeps each project's transcripts in a folder named after its
// path, with every character other than a letter or digit replaced by a dash
const transcriptDirectory = `${homedir()}/.claude/projects/${process.cwd().replace(/[^A-Za-z0-9]/g, '-')}`;

async function findLatestTranscript(): Promise<string> {
  const files = (await readdir(transcriptDirectory)).filter((file) =>
    file.endsWith('.jsonl'),
  );
  const modifiedTimes = await Promise.all(
    files.map(async (file) => ({
      file,
      modified: (await stat(`${transcriptDirectory}/${file}`)).mtimeMs,
    })),
  );
  const latest = modifiedTimes.sort(
    (first, second) => second.modified - first.modified,
  )[0];
  if (!latest) {
    exitWithError(`No transcripts found in ${transcriptDirectory}.`);
  }
  return `${transcriptDirectory}/${latest.file}`;
}

const transcriptPath = session
  ? `${transcriptDirectory}/${session}.jsonl`
  : await findLatestTranscript();

let transcript: string;
try {
  transcript = await readFile(transcriptPath, 'utf8');
} catch {
  exitWithError(`Couldn't read ${transcriptPath}.`);
}

const records = transcript
  .split('\n')
  .filter(Boolean)
  .map((line) => recordSchema.safeParse(JSON.parse(line)))
  .filter((result) => result.success)
  .map((result) => result.data);

function contentBlocks(record: z.infer<typeof recordSchema>): unknown[] {
  const content = record.message?.content;
  return Array.isArray(content) ? content : [];
}

const toolUses = new Map<string, z.infer<typeof toolUseSchema>>();
for (const record of records) {
  for (const block of contentBlocks(record)) {
    const toolUse = toolUseSchema.safeParse(block);
    if (toolUse.success) {
      toolUses.set(toolUse.data.id, toolUse.data);
    }
  }
}

function describe(toolUse: z.infer<typeof toolUseSchema>): string {
  const input = toolUse.input ?? {};
  const detail =
    input.command ?? input.url ?? input.query ?? input.file_path ?? '';
  const firstLine = String(detail).split('\n')[0] ?? '';
  return `${toolUse.name}  ${firstLine.slice(0, 120)}`.trim();
}

const approved: string[] = [];
const rejected: string[] = [];

for (const record of records) {
  for (const block of contentBlocks(record)) {
    const toolResult = toolResultSchema.safeParse(block);
    if (!toolResult.success) {
      continue;
    }
    const toolUse = toolUses.get(toolResult.data.tool_use_id);
    if (!toolUse) {
      continue;
    }

    if (JSON.stringify(toolResult.data.content).includes(REJECTION_TEXT)) {
      rejected.push(describe(toolUse));
    } else if (
      record.permissionDecision &&
      record.permissionDecision.source !== 'config'
    ) {
      approved.push(describe(toolUse));
    }
  }
}

console.log(`Transcript: ${transcriptPath}\n`);
console.log(`Tool calls approved by hand (${approved.length}):`);
for (const line of approved) {
  console.log(`  ${line}`);
}
console.log(`\nTool calls rejected (${rejected.length}):`);
for (const line of rejected) {
  console.log(`  ${line}`);
}
