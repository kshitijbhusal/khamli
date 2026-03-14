-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "fileKey" TEXT,
    "fileName" TEXT,
    "fileMime" TEXT,
    "fileSize" INTEGER,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_code_key" ON "Message"("code");

-- CreateIndex
CREATE INDEX "Message_code_idx" ON "Message"("code");

-- CreateIndex
CREATE INDEX "Message_expiresAt_idx" ON "Message"("expiresAt");
