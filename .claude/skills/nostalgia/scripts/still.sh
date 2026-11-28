#!/bin/bash
# Run from the Remotion project root: still.sh <frame> [frame...]
# Renders half-scale stills and tiles them side by side into out/sheet.png
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)
mkdir -p out
for fr in "$@"; do npx remotion still src/index.ts MangoFilm out/c_$fr.png --frame $fr --overwrite ${B:+--browser-executable=$B} --scale=0.5 2>&1 | grep -iE "error" | head -3; done
args=(); for fr in "$@"; do args+=(-i out/c_$fr.png); done
if [ $# -eq 1 ]; then cp out/c_$1.png out/sheet.png; else ffmpeg -v error -y "${args[@]}" -filter_complex hstack=$# out/sheet.png; fi
