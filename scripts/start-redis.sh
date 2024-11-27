#!/usr/bin/env bash

set -eou pipefail

docker run -d \
  --name my-redis-stack \
  --replace \
  -p 6379:6379 \
  docker.io/redis/redis-stack-server:latest
