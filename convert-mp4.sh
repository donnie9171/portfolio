#!/bin/bash

# Check for ffmpeg installation
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg could not be found. Please install it first."
    exit 1
fi

# Find and convert mp4 files
find . -iname '*.mp4' | while read file; do
    tmpfile="${file%.*}_tmp.mp4"
    ffmpeg -i "$file" -map 0 -c copy -bsf:v h264_metadata=video_full_range_flag=1 "$tmpfile" && mv "$tmpfile" "$file"
    echo "Processed $file with ffmpeg."
done