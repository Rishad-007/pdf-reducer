This is a Next.js app for reducing PDF file size with three compression modes: HIGH, MIDIUM, LOW.

## Features

- Upload PDF
- Choose compression mode (HIGH, MIDIUM, LOW)
- Compress server-side
- Download compressed PDF

## Requirements

This app uses Ghostscript on the server for PDF compression.

- macOS install: `brew install ghostscript`
- Verify install: `gs --version`

## Getting Started

Install dependencies and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Build

```bash
npm run build
```

## API

`POST /api/compress`

Form fields:

- `file`: PDF file
- `mode`: `HIGH` | `MIDIUM` | `LOW`

Returns:

- Compressed PDF as download stream
- JSON error response on failure
