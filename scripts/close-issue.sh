#!/bin/bash

usage="Usage: $0 <issue number> < comment"

if ! [[ "$1" =~ ^[0-9]+$ ]] || [ -t 0 ]; then
  echo "$usage" >&2
  exit 1
fi

issue_number="$1"
comment=$(cat)

if [ -z "$comment" ]; then
  echo "The closing comment (read from stdin) is empty." >&2
  exit 1
fi

# The --flag=value form stops a comment that starts with a dash from being read as another flag
gh issue close "$issue_number" \
  --repo github.com/alastair-smith/card-games \
  "--comment=$comment"
