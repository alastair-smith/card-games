#!/bin/bash

usage="Usage: $0 [--title <title>] [< body]"

title=''

if [ "$#" -eq 2 ] && [ "$1" = '--title' ] && [ -n "$2" ]; then
  title="$2"
elif [ "$#" -ne 0 ]; then
  echo "$usage" >&2
  exit 1
fi

if [ -n "$title" ] && ! [[ "$title" =~ ^(🚀|🔧|📚|🐛)\ [A-Z] ]]; then
  echo "The title must start with 🚀, 🔧, 📚 or 🐛, a space and a capital letter." >&2
  exit 1
fi

branch=$(git branch --show-current)

if [ -z "$branch" ] || [ "$branch" = 'main' ]; then
  echo "Only issue branches have a PR, not '${branch:-detached HEAD}'." >&2
  exit 1
fi

body=''
if ! [ -t 0 ]; then
  body=$(cat)
fi

edit_args=()
if [ -n "$title" ]; then
  edit_args+=("--title=$title")
fi
if [ -n "$body" ]; then
  edit_args+=("--body=$body")
fi

if [ "${#edit_args[@]}" -eq 0 ]; then
  echo "Pass a new title, a new body on stdin, or both." >&2
  echo "$usage" >&2
  exit 1
fi

# The --flag=value form stops a value that starts with a dash from being read as another flag
gh pr edit "$branch" \
  --repo github.com/alastair-smith/card-games \
  "${edit_args[@]}"
