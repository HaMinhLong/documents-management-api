/*
  Warnings:

  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `referral_histories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('active', 'draft', 'pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "transaction_type" AS ENUM ('deposit', 'withdrawal', 'purchase', 'sale', 'referral');

-- CreateEnum
CREATE TYPE "transaction_status" AS ENUM ('active', 'draft', 'pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "referral_status" AS ENUM ('active', 'draft', 'pending', 'paid', 'cancelled');

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "status",
ADD COLUMN     "status" "order_status" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "referral_histories" DROP COLUMN "status",
ADD COLUMN     "status" "referral_status" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "type",
ADD COLUMN     "type" "transaction_type" NOT NULL DEFAULT 'deposit',
DROP COLUMN "status",
ADD COLUMN     "status" "transaction_status" NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    "instruct_path" VARCHAR(255),
    "user_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "university_id" INTEGER NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "status" "user_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
