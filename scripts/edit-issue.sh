#!/bin/bash

usage="Usage: $0 <issue number> [--title <title>] [--add-label <label>]... [--remove-label <label>]... [--milestone <milestone>] [< body]"

if ! [[ "$1" =~ ^[0-9]+$ ]]; then
  echo "$usage" >&2
  exit 1
fi

issue_number="$1"
shift

edit_args=()

while [ "$#" -gt 0 ]; do
  if [ "$#" -lt 2 ] || [ -z "$2" ]; then
    echo "$usage" >&2
    exit 1
  fi

  case "$1" in
    --title) edit_args+=("--title=$2") ;;
    --add-label) edit_args+=("--add-label=$2") ;;
    --remove-label) edit_args+=("--remove-label=$2") ;;
    --milestone) edit_args+=("--milestone=$2") ;;
    *)
      echo "$usage" >&2
      exit 1
      ;;
  esac

  shift 2
done

if ! [ -t 0 ]; then
  body=$(cat)
  if [ -n "$body" ]; then
    edit_args+=("--body=$body")
  fi
fi

if [ "${#edit_args[@]}" -eq 0 ]; then
  echo "Pass at least one change: a flag, or a new body on stdin." >&2
  echo "$usage" >&2
  exit 1
fi

# The --flag=value form stops a value that starts with a dash from being read as another flag
gh issue edit "$issue_number" \
  --repo github.com/alastair-smith/card-games \
  "${edit_args[@]}"
