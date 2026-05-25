# Canva Frame Generator

A Canva App that converts PNG and SVG files into native Canva frames and editable vector shapes.

## Features

- **PNG to SVG Conversion**: Convert raster images to vector graphics using ImageTracerJS
- **SVG Optimization**: Clean and optimize SVG files for better performance
- **Native Canva Integration**: Insert converted graphics directly into Canva designs as frames or shapes
- **Real-time Preview**: Compare original and converted images before inserting
- **Customizable Settings**: Adjust trace threshold, smoothness, and output mode

## How It Works

1. **Upload**: Drag and drop a PNG or SVG file
2. **Preview**: See the original vs converted result
3. **Adjust**: Fine-tune conversion settings if needed
4. **Insert**: Add the graphic directly to your Canva design

## Tech Stack

- React 19 + TypeScript
- Canva Apps SDK
- ImageTracerJS (PNG to SVG tracing)
- jsPDF (PDF export fallback)

## Getting Started

### Prerequisites

- Node.js 22 or 24
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Limitations

- Canva Apps require a backend server for full authentication
- GitHub Pages hosting is suitable for static showcase only
- For production use, deploy with a backend (Vercel, Netlify Functions, etc.)

## License

See LICENSE.md for details.

## Acknowledgments

- Built with [Canva Apps SDK](https://github.com/Canva/canva-apps-sdk)
- PNG tracing powered by [ImageTracerJS](https://github.com/jankovicsandras/imagetracerjs)
