/*
  Warnings:

  - You are about to drop the column `referred_id` on the `referral_histories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "referral_histories" DROP CONSTRAINT "referral_histories_referred_id_fkey";

-- AlterTable
ALTER TABLE "referral_histories" DROP COLUMN "referred_id";
