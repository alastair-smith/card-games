#!/bin/bash

gh api repos/alastair-smith/card-games/milestones \
  --jq '.[] | "\(.title) — \(.description)"'
