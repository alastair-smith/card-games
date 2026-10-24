import { z } from 'zod';
import { exitWithError } from '../../lib/script-helpers.ts';

export const STORYBOOK_ORIGIN = 'http://localhost:6006';
const MCP_URL = `${STORYBOOK_ORIGIN}/mcp`;

export const STORY_ID = /^[a-z0-9-]+--[a-z0-9-]+$/;

const responseSchema = z.union([
  z.object({
    result: z.object({
      isError: z.boolean().optional(),
      content: z.array(z.object({ text: z.string().optional() })).optional(),
      structuredContent: z.unknown(),
    }),
  }),
  z.object({ error: z.object({ message: z.string() }) }),
]);

/**
 * Calls one of the tools on Storybook's MCP server and returns its structured
 * result checked against `schema`. Talks to the server over HTTP rather than
 * through Claude Code's MCP connection, which is only made when a session
 * starts, so this works whenever Storybook is up.
 */
export async function callStorybookTool<Schema extends z.ZodType>(
  name: string,
  toolArguments: Record<string, unknown>,
  schema: Schema,
): Promise<z.infer<Schema>> {
  let response: Response;
  try {
    response = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name, arguments: toolArguments },
      }),
    });
  } catch {
    exitWithError(
      `Couldn't reach Storybook at ${STORYBOOK_ORIGIN}. Start it with: pnpm --filter @repo/web dev:stories`,
    );
  }

  if (!response.ok) {
    exitWithError(`Storybook's MCP server answered ${response.status}.`);
  }

  // The server answers as server-sent events, with the JSON after `data: `
  const body = await response.text();
  const dataLine = body.split('\n').find((line) => line.startsWith('data: '));

  let json: unknown;
  try {
    json = JSON.parse(dataLine ? dataLine.slice('data: '.length) : body);
  } catch {
    exitWithError(
      "Storybook's MCP server answered with something other than JSON.",
    );
  }

  const parsedResponse = responseSchema.safeParse(json);
  if (!parsedResponse.success) {
    exitWithError(
      `Storybook's MCP server answered in an unexpected shape:\n${z.prettifyError(parsedResponse.error)}`,
    );
  }

  if ('error' in parsedResponse.data) {
    exitWithError(`${name} failed: ${parsedResponse.data.error.message}`);
  }

  const { isError, content, structuredContent } = parsedResponse.data.result;
  if (isError) {
    const message = content?.map((item) => item.text ?? '').join('\n');
    exitWithError(`${name} failed: ${message || 'no message'}`);
  }

  const parsedContent = schema.safeParse(structuredContent);
  if (!parsedContent.success) {
    exitWithError(
      `${name} answered in an unexpected shape, so the Storybook MCP addon may have changed:\n${z.prettifyError(parsedContent.error)}`,
    );
  }

  return parsedContent.data;
}

/**
 * The story on its own page, outside Storybook's UI. `args` is the `args`
 * parameter as Storybook encodes it, e.g. `user.name:Roz;user.isReady:!true`.
 */
export function getStandaloneUrl(storyId: string, args?: string): string {
  const url = `${STORYBOOK_ORIGIN}/iframe.html?id=${storyId}&viewMode=story`;
  return args ? `${url}&args=${args}` : url;
}
