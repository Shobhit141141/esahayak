/*
  Warnings:

  - The primary key for the `Buyer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Buyer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `BuyerHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `BuyerHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `buyerId` on the `BuyerHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."BuyerHistory" DROP CONSTRAINT "BuyerHistory_buyerId_fkey";

-- AlterTable
ALTER TABLE "public"."Buyer" DROP CONSTRAINT "Buyer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."BuyerHistory" DROP CONSTRAINT "BuyerHistory_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "buyerId",
ADD COLUMN     "buyerId" INTEGER NOT NULL,
ADD CONSTRAINT "BuyerHistory_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "public"."BuyerHistory" ADD CONSTRAINT "BuyerHistory_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
