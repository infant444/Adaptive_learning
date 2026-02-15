-- CreateTable
CREATE TABLE "Discussion" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "send_by" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "send_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Discussion_channel_id_idx" ON "Discussion"("channel_id");

-- CreateIndex
CREATE INDEX "Discussion_send_by_idx" ON "Discussion"("send_by");

-- CreateIndex
CREATE INDEX "Discussion_send_at_idx" ON "Discussion"("send_at");

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_send_by_fkey" FOREIGN KEY ("send_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
