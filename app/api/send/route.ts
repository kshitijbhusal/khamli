export const dynamic = "force-dynamic";


// app/api/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueCode, getExpiryTime } from "@/lib/code";
import { getUploadUrl } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, content, fileName, fileMime, fileSize } = body;

    if (!type) {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    // ── Text message ──────────────────────────────────────────────────────────
    if (type === "text") {
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return NextResponse.json({ error: "Empty message" }, { status: 400 });
      }
      if (content.length > 5000) {
        return NextResponse.json({ error: "Message too long (max 5000 chars)" }, { status: 400 });
      }

      const code = await generateUniqueCode();
      const expiresAt = getExpiryTime();

      await prisma.message.create({
        data: { code, type, content: content.trim(), expiresAt },
      });

      return NextResponse.json({ code, expiresAt });
    }

    // ── File / Image / PDF message ────────────────────────────────────────────
    if (type === "file" || type === "image" || type === "pdf") {
      if (!fileName || !fileMime || !fileSize) {
        return NextResponse.json({ error: "Missing file metadata" }, { status: 400 });
      }
      if (fileSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large (max 50 MB)" },
          { status: 400 }
        );
      }

      const code = await generateUniqueCode();
      const expiresAt = getExpiryTime();
      const fileKey = `uploads/${uuidv4()}/${fileName}`;

      // Create the DB record first (upload URL is short-lived)
      await prisma.message.create({
        data: {
          code,
          type,
          fileKey,
          fileName,
          fileMime,
          fileSize,
          expiresAt,
        },
      });

      // Return a pre-signed S3 upload URL — the browser uploads directly
      const uploadUrl = await getUploadUrl(fileKey, fileMime);

      return NextResponse.json({ code, expiresAt, uploadUrl, fileKey });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/send]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
