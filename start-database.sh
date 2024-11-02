#!/usr/bin/env bash

set -eou pipefail

podman run -d \
  --name card-games-postgres \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="postgres" \
  -e POSTGRES_DB=card-games \
  -p 5432:5432 \
  docker.io/postgres && echo "Database started successfully"
