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
      // Clean up expired record
      await prisma.message.delete({ where: { id: message.id } }).catch(() => {});
      return NextResponse.json(
        { error: "This code has expired. Messages self-destruct after 10 minutes." },
        { status: 410 }
      );
    }

    // Build response — for files, attach a short-lived signed download URL
    const response: Record<string, unknown> = {
      type: message.type,
      createdAt: message.createdAt,
      expiresAt: message.expiresAt,
    };

    if (message.type === "text") {
      response.content = message.content;
    } else if (message.fileKey && message.fileName) {
      const isViewable =
        message.type === "image" ||
        message.type === "pdf";

      response.fileName = message.fileName;
      response.fileMime = message.fileMime;
      response.fileSize = message.fileSize;

      // Viewable types get an inline URL + download URL
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
