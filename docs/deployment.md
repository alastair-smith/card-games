# Deployment

## Architecture

```mermaid
architecture-beta
    group oci(cloud)[OCI ARM Instance]

    service caddy(server)[Caddy] in oci
    service app(server)[Next.js] in oci
    service redis(database)[Redis] in oci

    service cloudflare(cloud)[Cloudflare]
    service users(internet)[Users]
    service github(server)[GitHub Actions]
    service dockerhub(cloud)[DockerHub]
    service tailscale(cloud)[Tailscale]

    users:R --> L:cloudflare
    cloudflare:R --> L:caddy
    caddy:R --> L:app
    app:R --> L:redis

    github:R --> L:dockerhub
    github:B --> T:tailscale
    tailscale:B --> T:oci
    dockerhub:R --> L:oci
```

Cloudflare terminates SSL for users and proxies traffic to Caddy on the OCI instance. Caddy reverse-proxies to the Next.js app and obtains a Let's Encrypt certificate automatically via ACME HTTP-01 challenge through the Cloudflare proxy. Cloudflare is configured for Full (Strict) SSL, which validates the origin certificate. Redis is only reachable within the Docker network. SSH access is via Tailscale only — port 22 is not open to the internet.

## Deploy pipeline

`.github/workflows/deploy.yml` runs on every push to `main` with two sequential jobs.

### Job 1: build-and-push

1. Generates OCI image metadata and tags (`docker/metadata-action`) — labels include git revision, build timestamp, and source URL
2. Builds the Docker image for `linux/arm64` using QEMU emulation on the GitHub Actions x86_64 runner
3. Pushes two tags to DockerHub: `:latest` and `:<short-sha>`

The first build takes ~10–15 minutes due to QEMU emulation. Subsequent builds are faster thanks to GitHub Actions layer cache (`type=gha`).

### Job 2: deploy

1. Connects the runner to Tailscale as `tag:github-actions`
2. Writes a `.env` file on the runner from GitHub secrets
3. Rsyncs `docker-compose.prod.yml`, `infrastructure/Caddyfile`, and `.env` to `/opt/card-games/` on the instance
4. SSHes in and runs `docker compose pull && docker compose up -d --remove-orphans`
5. Polls `GET http://localhost:3000/api/healthcheck` for up to 125 seconds to confirm the new container is healthy

## GitHub Actions secrets

All secrets are set in the repository under Settings → Secrets and Variables → Actions.

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | DockerHub username |
| `DOCKERHUB_TOKEN` | DockerHub access token (not your password) |
| `OCI_TAILSCALE_IP` | Instance's Tailscale IP (from Tailscale admin console after first `terraform apply`) |
| `TAILSCALE_OAUTH_CLIENT_ID` | OAuth client ID for the GitHub Actions runner |
| `TAILSCALE_OAUTH_SECRET` | OAuth client secret for the GitHub Actions runner |
| `AUTH_SECRET` | Session secret, min 32 chars — generate with `openssl rand -base64 32` |
| `REDIS_PASSWORD` | Redis auth password — generate with `openssl rand -base64 32` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | New Relic OTLP endpoint (`https://otlp.nr-data.net:4318` for US, `https://otlp.eu01.nr-data.net:4318` for EU) |
| `NEW_RELIC_LICENSE_KEY` | New Relic ingest licence key |
| `ADMIN_USERNAME` | Optional admin credentials |
| `ADMIN_PASSWORD` | Optional admin credentials |

## Triggering a deploy

Push to `main`. The workflow runs automatically. Monitor progress in the Actions tab.

To deploy without a code change:

```bash
git commit --allow-empty -m "🔧 Trigger deploy" && git push
```

## Verifying a deploy

Check the deployed version matches the expected commit:

```bash
curl -s https://playcards.games/api/healthcheck
```

To inspect container state on the instance:

```bash
ssh ubuntu@<tailscale-ip> \
  "docker compose -f /opt/card-games/docker-compose.prod.yml ps"
```

## Rollback

Use the **Rollback** workflow: Actions → Rollback → Run workflow → enter the short SHA to revert to.

Short-SHA tags are kept permanently on DockerHub, so any previous build can be redeployed. Find the SHA from the git log or from a previous deploy run in the Actions tab.

## Accessing Redis for debugging

Redis is not exposed outside the Docker network. Access it via the running container:

```bash
ssh ubuntu@<tailscale-ip>
cd /opt/card-games
REDIS_PASSWORD=$(grep REDIS_PASSWORD .env | cut -d= -f2-)
docker compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD
```
