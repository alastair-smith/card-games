#!/bin/bash

usage="Usage: $0 <issue number> <Triage|Backlog|Ready|In progress|In review|Done>"

if [ "$#" -ne 2 ] || ! [[ "$1" =~ ^[0-9]+$ ]]; then
  echo "$usage" >&2
  exit 1
fi

issue_number="$1"

case "$2" in
  Triage) status_option_id=d29ed546 ;;
  Backlog) status_option_id=f75ad846 ;;
  Ready) status_option_id=61e4505c ;;
  "In progress") status_option_id=47fc9ee4 ;;
  "In review") status_option_id=df73e18b ;;
  Done) status_option_id=98236657 ;;
  *)
    echo "$usage" >&2
    exit 1
    ;;
esac

item_id=$(gh project item-list 3 --owner alastair-smith --limit 500 --format json \
  --jq ".items[] | select(.content.number == ${issue_number}) | .id")

if [ -z "$item_id" ]; then
  echo "Issue #${issue_number} isn't on the board." >&2
  exit 1
fi

gh project item-edit \
  --project-id PVT_kwHOAWNxLc4A7LCG \
  --id "$item_id" \
  --field-id PVTSSF_lAHOAWNxLc4A7LCGzgvjLoQ \
  --single-select-option-id "$status_option_id" >/dev/null

echo "Moved #${issue_number} to $2."
