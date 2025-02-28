#!/bin/bash

# Read directories from file and format them as `-w dir1 -w dir2 ...`
WATCH_DIRS=$(awk '{print "-w " $0}' watch-dirs.txt | tr '\n' ' ')

# Run cargo watch with dynamically loaded directories
cargo watch $WATCH_DIRS -q -s 'yarn workspace @hogg/wasm run build'
