#!/bin/bash

# Check for ImageMagick installation
if ! command -v magick &> /dev/null; then
    echo "ImageMagick could not be found. Please install it first."
    exit 1
fi

# Find and convert images (PNG, JPG, JPEG, HEIC, WEBP)
find . -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.heic' -o -iname '*.webp' | while read file; do
    # Convert to AVIF
    magick "$file" -strip -quality 85 "${file%.*}.avif" && rm "$file"
    echo "Converted $file to AVIF."
done

# Check if any files were converted
if [ "$(find . -iname '*.avif' | wc -l)" -gt 0 ]; then
    echo "AVIF conversion completed. You can now commit your changes."
else
    echo "No PNG, JPG, JPEG, HEIC, or WEBP files found. No conversion needed."
fi