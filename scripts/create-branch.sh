#!/bin/bash

usage="Usage: $0 <issue number> <short-description in kebab-case>"

if [ "$#" -ne 2 ] || ! [[ "$1" =~ ^[0-9]+$ ]] || ! [[ "$2" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "$usage" >&2
  exit 1
fi

issue_number="$1"
branch_name="i-${issue_number}/$2"

gh issue develop "$issue_number" \
  --repo github.com/alastair-smith/card-games \
  --name "$branch_name" \
  --base main \
  --checkout
