// lib/code.ts
import { prisma } from "./prisma";

const CHARS = "23456789ABCDEFGHJKLMNPQRST"; // no I/O/0/1 — easy to read aloud

/**
 * Generates a unique 6-char alphanumeric code.
 * Retries up to 10 times in the unlikely case of a collision.
 */
export async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    const existing = await prisma.message.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique code — try again.");
}

/**
 * Returns the expiry time 10 minutes from now.
 */
export function getExpiryTime(hour: number): Date {
  
  return new Date(Date.now() + hour * 60 * 60 * 1000);
}
