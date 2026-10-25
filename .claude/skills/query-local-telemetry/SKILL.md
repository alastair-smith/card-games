---
name: query-local-telemetry
description: Query traces from the local Jaeger while debugging the app in development. Use to answer questions like "did this request hit Redis?", "which tRPC call failed?", "how long did this take?" or "is this span still being emitted?". Local development only, not production telemetry.
---

# Query local telemetry

The app sends traces to the Jaeger in `docker-compose.yml`. Jaeger serves an
MCP server, `jaeger`, on the same port as its UI, so query it with the
`mcp__jaeger__*` tools rather than `curl`. They're read-only and allowlisted.

## When Jaeger isn't available

`pnpm dev` starts Jaeger before the dev server, so the `jaeger` tools are
normally there while it runs.

If the tools are missing, check whether Jaeger is running:

```bash
docker compose ps jaeger
```

If it isn't, start the background services:

```bash
pnpm background-services
```

Claude Code connects to MCP servers when the session starts, so once Jaeger is
up the tools only appear in a new session.

Jaeger keeps traces in memory, so restarting its container clears them.

## Services and environments

- `card-games`: the Node server, including tRPC, Redis and HTTP spans
- `card-games-web`: the browser, sent through `/api/telemetry`

A local production build also reports as `card-games`. Server spans carry
`deployment.environment.name`, `development` for `pnpm dev` and `production`
for a build, so filter `search_traces` on it with `attributes`:

```json
{
  "service_name": "card-games",
  "attributes": { "deployment.environment.name": "development" }
}
```

Browser spans don't have the attribute, so leave the filter off when
searching `card-games-web`.

## Queries

| Question | Tool |
|---|---|
| Recent traces | `search_traces` with `service_name`; `start_time_min` defaults to `-1h` |
| Traces for one operation, e.g. `trpc.lobby.create` or `GET /yaniv` | `search_traces` with `span_name` |
| Traces that failed | `search_traces` with `with_errors: true` |
| Which operations exist | `get_span_names` with `service_name` |
| A trace's spans with durations and status | `get_trace_topology` with `trace_id` |
| Why a trace failed | `get_trace_errors` with `trace_id` |
| A span's attributes and events, e.g. the Redis command | `get_span_details` with `trace_id` and `span_ids` |
| What made a trace slow | `get_critical_path` with `trace_id` |

Start with `search_traces` or `get_span_names`, then use a trace ID to look at
one trace. `get_trace_topology` leaves out attributes, so only fetch
`get_span_details` for the spans you need.

tRPC subscriptions hold a `GET /api/trpc/[trpc]` request open for as long as a
page is open, so those traces can last minutes or hours. That's not a slow
request. Leave them out when looking for slow traces, e.g. with `duration_max`.

## Logs

The server also sends OTLP logs, but Jaeger only stores traces. Server logs
are in the `pnpm dev` console output.
