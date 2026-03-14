// app/api/cleanup/route.ts
// Intended to be called by a cron job every 5 minutes.
// Example: Vercel Cron (vercel.json), or an external service like cron-job.org
// Protect with CRON_SECRET to prevent abuse.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/s3";

export async function GET(req: NextRequest) {
  // Accept either our own CRON_SECRET header or Vercel's built-in cron authorization
  const secret = req.headers.get("x-cron-secret");
  const vercelAuth = req.headers.get("authorization");
  const validSecret = secret === process.env.CRON_SECRET;
  const validVercel =
    vercelAuth === `Bearer ${process.env.CRON_SECRET}` ||
    req.headers.get("x-vercel-cron-auth") !== null; // Vercel sets this on cron calls

  if (!validSecret && !validVercel) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expired = await prisma.message.findMany({
      where: { expiresAt: { lt: new Date() } },
      select: { id: true, fileKey: true },
    });

    if (expired.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    // Delete S3 objects for file-type messages
    const s3Deletions = expired
      .filter((m) => m.fileKey)
      .map((m) => deleteFile(m.fileKey!).catch((e) => console.error("S3 delete failed:", m.fileKey, e)));

    await Promise.all(s3Deletions);

    // Delete DB records in bulk
    const { count } = await prisma.message.deleteMany({
      where: { id: { in: expired.map((m) => m.id) } },
    });

    console.log(`[cleanup] Deleted ${count} expired messages`);
    return NextResponse.json({ deleted: count });
  } catch (err) {
    console.error("[GET /api/cleanup]", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
