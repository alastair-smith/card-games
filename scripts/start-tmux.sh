#!/bin/bash

# Name of the tmux session (can be project folder name)
SESSION_NAME=$(basename "$PWD")

# Ensure no conflicting session
tmux has-session -t "$SESSION_NAME" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "Session $SESSION_NAME already exists. Attaching..."
  tmux attach -t "$SESSION_NAME"
  exit 0
fi

# Start a new detached session with window "dev"
tmux new-session -d -s "$SESSION_NAME" -c "$PWD" -n dev

# Pane 1: run `pnpm dev`
tmux send-keys -t "$SESSION_NAME:dev.0" 'pnpm dev' C-m

# Split horizontally and run `pnpm test` in pane 1
tmux split-window -h -t "$SESSION_NAME:dev" -c "$PWD"
tmux send-keys -t "$SESSION_NAME:dev.1" 'pnpm test' C-m

# Create window "zsh"
tmux new-window -t "$SESSION_NAME" -n zsh -c "$PWD"

# Pane 0: show latest git commit
tmux send-keys -t "$SESSION_NAME:zsh.0" 'git --no-pager log -1' C-m

# Split horizontally and run default shell
tmux split-window -h -t "$SESSION_NAME:zsh" -c "$PWD"

# Attach to session
tmux select-window -t "$SESSION_NAME:dev"
tmux attach -t "$SESSION_NAME"
