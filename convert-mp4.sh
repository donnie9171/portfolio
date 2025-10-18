#!/bin/bash

# Check for ffmpeg installation
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg could not be found. Please install it first."
    exit 1
fi

# Find and convert mp4 files (limit resolution to 1280px wide and bitrate to 1M)
find . -iname '*.mp4' -print0 | while IFS= read -r -d '' file; do
    tmpfile="${file%.*}_tmp.mp4"
    ffmpeg -i "$file" -vf "scale=1280:-2" -b:v 1M -c:a copy "$tmpfile" && mv "$tmpfile" "$file"
    echo "Processed $file with ffmpeg (1280px wide, 1M bitrate)."
done