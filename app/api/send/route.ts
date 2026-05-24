export const dynamic = "force-dynamic";

// app/api/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueCode, getExpiryTime } from "@/lib/code";
import { getUploadUrl } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
const MAX_FILES = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, expireAtHour } = body;

    if (!type) {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    // ── Text message ──────────────────────────────────────────────────────────
    if (type === "text") {
      const { content } = body;
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return NextResponse.json({ error: "Empty message" }, { status: 400 });
      }
      if (content.length > 5000) {
        return NextResponse.json({ error: "Message too long (max 5000 chars)" }, { status: 400 });
      }

      const code = await generateUniqueCode();
      const expiresAt = getExpiryTime(expireAtHour);

      console.log("Expires at:", expiresAt);

      await prisma.message.create({
        data: { code, type, content: content.trim(), expiresAt },
      });

      return NextResponse.json({ code, expiresAt });
    }

    // ── Multi-file batch ──────────────────────────────────────────────────────
    // Accepts: { type: "files", files: [{ fileName, fileMime, fileSize }], caption? }
    if (type === "files") {
      const { files, caption } = body as {
        files: { fileName: string; fileMime: string; fileSize: number }[];
        caption?: string;
      };

      if (!Array.isArray(files) || files.length === 0) {
        return NextResponse.json({ error: "No files provided" }, { status: 400 });
      }
      if (files.length > MAX_FILES) {
        return NextResponse.json(
          { error: `Too many files (max ${MAX_FILES})` },
          { status: 400 }
        );
      }

      // Validate every file's metadata
      for (const f of files) {
        if (!f.fileName || !f.fileMime || !f.fileSize) {
          return NextResponse.json({ error: "Missing file metadata" }, { status: 400 });
        }
        if (f.fileSize > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `"${f.fileName}" exceeds the 500 MB limit` },
            { status: 400 }
          );
        }
      }

      const code = await generateUniqueCode();
      const expiresAt = getExpiryTime(expireAtHour);

      // All files share one folder in S3: uploads/{folderUUID}/
      const folderUUID = uuidv4();

      // Build per-file keys and presigned URLs (in parallel for speed)
      const fileRecords = await Promise.all(
        files.map(async (f) => {
          const fileKey = `uploads/${folderUUID}/${f.fileName}`;
          const uploadUrl = await getUploadUrl(fileKey, f.fileMime);
          return {
            fileKey,
            fileName: f.fileName,
            fileMime: f.fileMime,
            fileSize: f.fileSize,
            uploadUrl, // returned to client, NOT stored in DB
          };
        })
      );

      // Store one DB record for the whole batch
      // `content` holds the caption (if any); `fileKey` holds the shared folder path;
      // `filesMeta` is a JSON array of { fileKey, fileName, fileMime, fileSize }
      await prisma.message.create({
        data: {
          code,
          type,                          // "files"
          fileKey: `uploads/${folderUUID}/`, // folder prefix for easy listing
          content: caption?.trim() || null,
          filesMeta: JSON.stringify(         // store all file info as JSON
            fileRecords.map(({ uploadUrl: _url, ...rest }) => rest)
          ),
          expiresAt,
        },
      });

      // Return one code + one presigned URL per file
      return NextResponse.json({
        code,
        expiresAt,
        files: fileRecords.map(({ fileName, fileMime, fileKey, uploadUrl }) => ({
          fileName,
          fileMime,
          fileKey,
          uploadUrl,
        })),
      });
    }

    // ── Legacy single-file / image / pdf ─────────────────────────────────────
    if (type === "file" || type === "image" || type === "pdf") {
      const { fileName, fileMime, fileSize } = body;
      if (!fileName || !fileMime || !fileSize) {
        return NextResponse.json({ error: "Missing file metadata" }, { status: 400 });
      }
      if (fileSize > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File too large (max 500 MB)" }, { status: 400 });
      }

      const code = await generateUniqueCode();
      const expiresAt = getExpiryTime(expireAtHour);
      const fileKey = `uploads/${uuidv4()}/${fileName}`;

      await prisma.message.create({
        data: { code, type, fileKey, fileName, fileMime, fileSize, expiresAt },
      });

      const uploadUrl = await getUploadUrl(fileKey, fileMime);
      return NextResponse.json({ code, expiresAt, uploadUrl, fileKey });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/send]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
