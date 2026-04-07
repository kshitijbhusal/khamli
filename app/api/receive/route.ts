export const dynamic = "force-dynamic";

// app/api/receive/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/s3";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code")?.toUpperCase().trim();

    if (!code || code.length !== 4) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const message = await prisma.message.findUnique({ where: { code } });

    if (!message) {
      return NextResponse.json(
        { error: "Code not found. It may have expired or never existed." },
        { status: 404 }
      );
    }

    if (message.expiresAt < new Date()) {
      await prisma.message.delete({ where: { id: message.id } }).catch(() => {});
      return NextResponse.json(
        { error: "This code has expired. Messages self-destruct after 10 minutes." },
        { status: 410 }
      );
    }

    const response: Record<string, unknown> = {
      type: message.type,
      createdAt: message.createdAt,
      expiresAt: message.expiresAt,
    };

    // ── Text ──────────────────────────────────────────────────────────────────
    if (message.type === "text") {
      response.content = message.content;

    // ── Multi-file batch ──────────────────────────────────────────────────────
    } else if (message.type === "files" && message.filesMeta) {
      const fileMetas: {
        fileKey: string;
        fileName: string;
        fileMime: string;
        fileSize: number;
      }[] = JSON.parse(message.filesMeta);

      // Generate signed URLs for every file in parallel
      const files = await Promise.all(
        fileMetas.map(async (f) => {
          const isViewable =
            f.fileMime.startsWith("image/") || f.fileMime === "application/pdf";
          return {
            fileName: f.fileName,
            fileMime: f.fileMime,
            fileSize: f.fileSize,
            viewUrl: isViewable
              ? await getDownloadUrl(f.fileKey, f.fileName, true)
              : null,
            downloadUrl: await getDownloadUrl(f.fileKey, f.fileName, false),
          };
        })
      );

      response.files = files;
      response.caption = message.content ?? null;

    // ── Legacy single file / image / pdf ─────────────────────────────────────
    } else if (message.fileKey && message.fileName) {
      const isViewable = message.type === "image" || message.type === "pdf";
      response.fileName = message.fileName;
      response.fileMime = message.fileMime;
      response.fileSize = message.fileSize;
      if (isViewable) {
        response.viewUrl = await getDownloadUrl(message.fileKey, message.fileName, true);
      }
      response.downloadUrl = await getDownloadUrl(message.fileKey, message.fileName, false);
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("[GET /api/receive]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
