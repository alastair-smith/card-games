#!/usr/bin/env bash
# Creates or updates the PR comment showing the Storybook preview's status.
#
#   storybook-preview-comment.sh building
#   storybook-preview-comment.sh ready <preview url>
#   storybook-preview-comment.sh failed
#
# Reads GH_TOKEN, PR_NUMBER and HEAD_SHA from the environment. The comment's
# first line is a hidden marker holding the last good build's URL and commit,
# so a rebuild or a failure can still link to the preview that's up.
set -euo pipefail

status=$1
marker='<!-- storybook-preview'
badges_url='https://stories.playcards.games/preview-badges'
run_url="$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
sha=${HEAD_SHA::7}

comment_id=$(gh api "repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments" --paginate \
  --jq ".[] | select(.user.login == \"github-actions[bot]\" and (.body | startswith(\"$marker\"))) | .id" |
  head -n 1)

last_url=''
last_sha=''
if [[ -n $comment_id ]]; then
  first_line=$(gh api "repos/$GITHUB_REPOSITORY/issues/comments/$comment_id" --jq '.body' | head -n 1)
  last_url=$(sed -n 's/.* url=\([^ ]*\).*/\1/p' <<<"$first_line")
  last_sha=$(sed -n 's/.* sha=\([^ ]*\).*/\1/p' <<<"$first_line")
fi

case $status in
  building)
    if [[ -n $last_url ]]; then
      badge=updating
      alt='Storybook: updating, last build still up'
      link=$last_url
      text="Building $sha. The link shows the last build, from $last_sha."
    else
      badge=building
      alt='Storybook: building preview'
      link=$run_url
      text="Building $sha."
    fi
    ;;
  ready)
    last_url=$2
    last_sha=$sha
    badge=ready
    alt='Storybook: preview ready'
    link=$last_url
    text="Built from $sha."
    ;;
  failed)
    badge=failed
    alt='Storybook: build failed'
    link=$run_url
    text="Build failed on $sha."
    if [[ -n $last_url ]]; then
      text="$text The [last build]($last_url), from $last_sha, is still up."
    fi
    ;;
  *)
    echo "Unknown status '$status': expected building, ready or failed" >&2
    exit 1
    ;;
esac

# The commit in the query gives each update a new image URL, so GitHub's image
# proxy can't keep showing an image it cached for an earlier one
body="$marker url=$last_url sha=$last_sha -->
[![$alt]($badges_url/storybook-$badge.svg?sha=$sha)]($link)

$text"

if [[ -n $comment_id ]]; then
  gh api --method PATCH "repos/$GITHUB_REPOSITORY/issues/comments/$comment_id" -f body="$body" >/dev/null
else
  gh api --method POST "repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments" -f body="$body" >/dev/null
fi
