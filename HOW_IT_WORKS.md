# PDF Size Reducer - How It Works

This document explains the complete flow of your app with real code examples from the project.

## 1. High-Level Architecture

The app has 2 main parts:

1. Client page: `app/page.tsx`
2. Server API route: `app/api/compress/route.ts`

Flow:

1. User uploads a PDF and selects a mode (`HIGH`, `MIDIUM`, `LOW`)
2. Client sends `multipart/form-data` to `/api/compress`
3. Server validates input and compresses with Ghostscript (`gs`)
4. Server returns compressed PDF bytes
5. Client triggers browser download

## 2. Frontend: Upload + Mode + Submit

File: `app/page.tsx`

### Compression modes

```ts
type CompressionMode = "HIGH" | "MIDIUM" | "LOW";

const MODE_OPTIONS: Array<{ value: CompressionMode; description: string }> = [
  { value: "HIGH", description: "Smallest size, lowest visual quality" },
  { value: "MIDIUM", description: "Balanced size and quality" },
  { value: "LOW", description: "Larger size, higher visual quality" },
];
```

Explanation:

- A strict union type ensures only supported mode values are used.
- `MODE_OPTIONS` drives the radio UI and labels.

### State management

```ts
const [file, setFile] = useState<File | null>(null);
const [mode, setMode] = useState<CompressionMode>("MIDIUM");
const [isCompressing, setIsCompressing] = useState(false);
const [status, setStatus] = useState<string>("");
const [error, setError] = useState<string>("");
```

Explanation:

- `file`: current uploaded PDF.
- `mode`: selected compression level.
- `isCompressing`: button loading state.
- `status` and `error`: user feedback messages.

### Submit handler and API call

```ts
const formData = new FormData();
formData.append("file", file);
formData.append("mode", mode);

const response = await fetch("/api/compress", {
  method: "POST",
  body: formData,
});
```

Explanation:

- The frontend sends binary file data via `FormData`.
- No JSON encoding is needed for file uploads.

### Download the returned PDF

```ts
const blob = await response.blob();
const outputName = file.name.replace(/\.pdf$/i, "") + "-compressed.pdf";
const url = URL.createObjectURL(blob);
const anchor = document.createElement("a");
anchor.href = url;
anchor.download = outputName;
anchor.click();
URL.revokeObjectURL(url);
```

Explanation:

- Server responds with raw PDF bytes.
- Browser creates a temporary object URL.
- Synthetic anchor click starts download automatically.

## 3. Backend: Validation + Compression

File: `app/api/compress/route.ts`

### Mode mapping to Ghostscript settings

```ts
const MODE_TO_PDF_SETTING: Record<CompressionMode, string> = {
  HIGH: "/screen",
  MIDIUM: "/ebook",
  LOW: "/printer",
};
```

Explanation:

- Ghostscript accepts predefined quality profiles.
- `HIGH` is strongest compression, `LOW` preserves more quality.

### Request validation

```ts
if (!(incoming instanceof File)) {
  return NextResponse.json({ error: "Missing PDF file." }, { status: 400 });
}

if (!["HIGH", "MIDIUM", "LOW"].includes(normalizedMode)) {
  return NextResponse.json(
    { error: "Invalid compression mode." },
    { status: 400 },
  );
}

if (incoming.type !== "application/pdf") {
  return NextResponse.json(
    { error: "Only application/pdf uploads are supported." },
    { status: 400 },
  );
}
```

Explanation:

- Rejects bad requests early.
- Prevents unsupported file types and invalid mode values.

### Temporary files and Ghostscript execution

```ts
const tempFolder = await fs.mkdtemp(path.join(os.tmpdir(), "pdf-compress-"));
const inputPath = path.join(tempFolder, "input.pdf");
const outputPath = path.join(tempFolder, "output.pdf");

await runGhostscript([
  "-sDEVICE=pdfwrite",
  "-dCompatibilityLevel=1.4",
  "-dPDFSETTINGS=" + MODE_TO_PDF_SETTING[normalizedMode],
  "-dNOPAUSE",
  "-dQUIET",
  "-dBATCH",
  "-sOutputFile=" + outputPath,
  inputPath,
]);
```

Explanation:

- Uploaded bytes are written to a temp input file.
- `gs` creates compressed output PDF.
- Temp directory is always deleted in `finally`.

### Binary response

```ts
const compressedPdf = await fs.readFile(outputPath);

return new NextResponse(compressedPdf, {
  status: 200,
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="compressed.pdf"',
  },
});
```

Explanation:

- The API returns file bytes directly (not JSON).
- Browser can download immediately.

## 4. SEO Implementation

### Metadata setup

File: `app/layout.tsx`

- `metadataBase` and canonical URL
- Open Graph metadata for social previews
- Twitter metadata
- Robots directives (`index`, `follow`)
- Keyword and description targeting PDF compression searches

### Crawl files

- `app/sitemap.ts` generates `/sitemap.xml`
- `app/robots.ts` generates `/robots.txt`

Both use `NEXT_PUBLIC_SITE_URL` when provided.

## 5. Environment Requirements

The server needs Ghostscript installed.

macOS example:

```bash
brew install ghostscript
gs --version
```

Without Ghostscript, the API returns an error:

"Ghostscript is not installed on the server. Install it and try again."

## 6. End-to-End Sequence

1. User picks PDF and mode on page
2. `onCompress` sends `FormData` to API
3. API validates file/mode/size
4. API compresses with Ghostscript profile
5. API returns compressed PDF bytes
6. Client starts download

## 7. Notes

- Current mode label is intentionally spelled `MIDIUM` in code to match your requirement.
- Maximum upload size is currently 25MB.
- This structure is suitable for Vercel, as compression runs in a server route.
