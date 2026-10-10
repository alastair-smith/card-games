#!/bin/bash

usage="Usage: $0 --title <title> --label <label>... [--milestone <milestone>] < body"

title=''
milestone=''
labels=()

while [ "$#" -gt 0 ]; do
  if [ "$#" -lt 2 ] || [ -z "$2" ]; then
    echo "$usage" >&2
    exit 1
  fi

  case "$1" in
    --title) title="$2" ;;
    --label) labels+=("--label=$2") ;;
    --milestone) milestone="$2" ;;
    *)
      echo "$usage" >&2
      exit 1
      ;;
  esac

  shift 2
done

if [ -z "$title" ] || [ "${#labels[@]}" -eq 0 ] || [ -t 0 ]; then
  echo "$usage" >&2
  exit 1
fi

body=$(cat)

if [ -z "$body" ]; then
  echo "The issue body (read from stdin) is empty." >&2
  exit 1
fi

milestone_args=()
if [ -n "$milestone" ]; then
  milestone_args=("--milestone=$milestone")
fi

# The --flag=value form stops a value that starts with a dash from being read as another flag
gh issue create \
  --repo github.com/alastair-smith/card-games \
  "--title=$title" \
  "--body=$body" \
  "${labels[@]}" \
  "${milestone_args[@]}"
