-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nonce" TEXT,
ADD COLUMN     "nonceExpiresAt" TIMESTAMP(3);
