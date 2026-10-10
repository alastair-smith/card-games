#!/bin/bash

usage="Usage: $0 --title <title> < body"

if [ "$#" -ne 2 ] || [ "$1" != '--title' ] || [ -z "$2" ] || [ -t 0 ]; then
  echo "$usage" >&2
  exit 1
fi

title="$2"

if ! [[ "$title" =~ ^(🚀|🔧|📚|🐛)\ [A-Z] ]]; then
  echo "The title must start with 🚀, 🔧, 📚 or 🐛, a space and a capital letter." >&2
  exit 1
fi

branch=$(git branch --show-current)

if [ -z "$branch" ] || [ "$branch" = 'main' ]; then
  echo "Only issue branches can have a PR, not '${branch:-detached HEAD}'." >&2
  exit 1
fi

body=$(cat)

if [ -z "$body" ]; then
  echo "The PR body (read from stdin) is empty." >&2
  exit 1
fi

# The --flag=value form stops a value that starts with a dash from being read as another flag
gh pr create \
  --repo github.com/alastair-smith/card-games \
  --base main \
  "--head=$branch" \
  "--title=$title" \
  "--body=$body"
