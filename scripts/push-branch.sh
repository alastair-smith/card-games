#!/bin/bash

if [ "$#" -ne 0 ]; then
  echo "Usage: $0" >&2
  exit 1
fi

branch=$(git branch --show-current)

if [ -z "$branch" ] || [ "$branch" = 'main' ]; then
  echo "Only issue branches can be pushed, not '${branch:-detached HEAD}'." >&2
  exit 1
fi

git push --set-upstream origin "HEAD:refs/heads/${branch}"
