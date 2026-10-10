#!/bin/bash

case "$1" in
  "") status_filter='select(.status != "Done")' ;;
  --include-done) status_filter='.' ;;
  *)
    echo "Usage: $0 [--include-done]" >&2
    exit 1
    ;;
esac

gh project item-list 3 --owner alastair-smith --limit 500 --format json \
  --jq ".items[] | ${status_filter} | \"#\(.content.number) [\(.status)] \(.title) — \(.milestone.title // \"no milestone\")\""
