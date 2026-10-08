#!/bin/sh
# Fails when src/ references a legacy alias token retired by the Ink & Paper migration.
# rg exit codes: 0 = match (fail), 1 = no match (pass), anything else = error (fail).

if ! command -v rg >/dev/null 2>&1; then
  echo "lint:tokens: ripgrep (rg) is required but was not found on PATH" >&2
  exit 1
fi

rg -n 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src
status=$?

case $status in
  0)
    echo "lint:tokens: legacy alias tokens found above; use Ink & Paper tokens instead" >&2
    exit 1
    ;;
  1) exit 0 ;;
  *)
    echo "lint:tokens: rg failed with exit code $status" >&2
    exit 1
    ;;
esac
