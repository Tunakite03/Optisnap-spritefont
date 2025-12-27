# Sprite Font Generator

A desktop application built with Tauri and React for creating sprite fonts from individual character images.

## Features

-  Load individual character PNG images from a directory
-  Adjust spacing for each character independently
-  Control bottom padding for proper alignment
-  Real-time preview of the sprite font
-  Generate sprite font image and configuration file
-  Cross-platform support (Windows, macOS, Linux)

## How to Use

1. **Select Images Directory**: Browse and select the folder containing your character PNG files. Each character should be saved as `{character}.png` (e.g., `0.png`, `1.png`, `,.png`, `..png`)

2. **Enter Characters**: Type the characters in the order you want them to appear in the sprite font (e.g., "0123456789,.")

3. **Adjust Spacing**: Use the sliders to adjust spacing for each character and bottom padding

4. **Preview**: The preview updates automatically as you adjust settings

5. **Generate**: Click "Generate Sprite Font" to save the final sprite font image and config file

## Development

### Prerequisites

-  Node.js and pnpm
-  Rust
-  Tauri CLI

### Setup

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## Output Files

The tool generates two files:

1. **Sprite Font Image** (PNG): Contains all characters arranged horizontally
2. **config.txt**: Contains spacing information and dimensions

## Based On

This tool is a Tauri implementation of the original Python sprite font generator using OpenCV.
