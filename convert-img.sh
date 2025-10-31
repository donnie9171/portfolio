#!/bin/bash

# Check for ImageMagick installation
if ! command -v magick &> /dev/null; then
    echo "ImageMagick could not be found. Please install it first."
    exit 1
fi

# Find and convert images (PNG, JPG, JPEG, HEIC, WEBP), ignoring treehouse folder
find . \( -path './treehouse' -o -path './treehouse/*' \) -prune -o \
    \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.heic' -o -iname '*.webp' \) -print | while read file; do
    # Convert to AVIF
    magick "$file" -strip -quality 85 "${file%.*}.avif" && rm "$file"
    echo "Converted $file to AVIF."
done

# Check if any files were converted
if [ "$(find . \( -path './treehouse' -o -path './treehouse/*' \) -prune -o -iname '*.avif' -print | wc -l)" -gt 0 ]; then
    echo "AVIF conversion completed. You can now commit your changes."
else
    echo "No PNG, JPG, JPEG, HEIC, or WEBP files found outside treehouse. No conversion needed."
fi