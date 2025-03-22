/*
  Warnings:

  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'completed', 'failed');

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "status",
ADD COLUMN     "status" "payment_status" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "status",
ADD COLUMN     "status" "payment_status" NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "referral_histories" (
    "id" SERIAL NOT NULL,
    "referred_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "commission_amount" DECIMAL(15,2) NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "referral_histories" ADD CONSTRAINT "referral_histories_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_histories" ADD CONSTRAINT "referral_histories_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
