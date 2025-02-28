#!/bin/bash

# Check if a filename was provided
if [ -z "$1" ]; then
  echo "Usage: $0 <file>"
  exit 1
fi

# Check that file exists
if [ ! -f "$1" ]; then
  echo "File $1 does not exist."
  exit 1
fi

FILE=$1

# Check if the file has differences compared to the last commit, and output the diff
if git diff --quiet -- "$FILE"; then
  echo "No changes detected in $FILE."
  exit 0
else
  echo "Differences detected in $FILE!"
  git diff -- "$FILE"
  exit 1
fi
