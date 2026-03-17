ALTER TABLE "Service"
ADD COLUMN "barberId" TEXT;

CREATE INDEX "Service_barberId_idx" ON "Service"("barberId");

ALTER TABLE "Service"
ADD CONSTRAINT "Service_barberId_fkey"
FOREIGN KEY ("barberId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
