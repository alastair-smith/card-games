#!/bin/bash

set -o pipefail

usage="Usage: $0 <job id>"

if ! [[ "$1" =~ ^[0-9]+$ ]]; then
  echo "$usage" >&2
  exit 1
fi

# gh run view won't show any logs until the whole run finishes, but this
# endpoint serves each job's log as soon as that job is done
gh api "repos/alastair-smith/card-games/actions/jobs/$1/logs" --allow-escape-sequences |
  sed 's/\x1b\[[0-9;]*[A-Za-z]//g'
