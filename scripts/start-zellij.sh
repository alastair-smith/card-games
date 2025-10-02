#!/usr/bin/env bash

set -eou pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

if ! command -v zellij &> /dev/null
then
    echo "zellij could not be found. Please install it: https://zellij.dev/documentation/installation.html"
    exit 1
fi

if zellij list-sessions 2>/dev/null | grep -q "card-games"; then
    zellij kill-session card-games
fi

zellij -n "$SCRIPT_DIR/../dev.kdl" -s card-games
