import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";

type CompressionMode = "HIGH" | "MIDIUM" | "LOW";

const MODE_TO_PDF_SETTING: Record<CompressionMode, string> = {
  HIGH: "/screen",
  MIDIUM: "/ebook",
  LOW: "/printer",
};

function runGhostscript(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const process = spawn("gs", args, { stdio: "pipe" });

    let stderr = "";
    process.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    process.on("error", (error) => {
      reject(error);
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr || `Ghostscript exited with code ${code}.`));
    });
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const incoming = formData.get("file");
  const mode = formData.get("mode");

  if (!(incoming instanceof File)) {
    return NextResponse.json({ error: "Missing PDF file." }, { status: 400 });
  }

  const normalizedMode = (mode ?? "MIDIUM") as CompressionMode;
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

  // 25MB guardrail for predictable memory and processing time.
  if (incoming.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Please upload a PDF up to 25MB." },
      { status: 400 },
    );
  }

  const tempFolder = await fs.mkdtemp(path.join(os.tmpdir(), "pdf-compress-"));
  const inputPath = path.join(tempFolder, "input.pdf");
  const outputPath = path.join(tempFolder, "output.pdf");

  try {
    const inputBuffer = Buffer.from(await incoming.arrayBuffer());
    await fs.writeFile(inputPath, inputBuffer);

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

    const compressedPdf = await fs.readFile(outputPath);

    return new NextResponse(compressedPdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("ENOENT")
        ? "Ghostscript is not installed on the server. Install it and try again."
        : "Failed to compress this PDF.";

    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await fs.rm(tempFolder, { recursive: true, force: true });
  }
}
