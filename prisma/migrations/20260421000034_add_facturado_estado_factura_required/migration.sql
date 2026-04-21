/*
  Warnings:

  - Made the column `folio_fiscal` on table `facturas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `serie` on table `facturas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `folio` on table `facturas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fecha_timbrado` on table `facturas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total` on table `facturas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "EstadoPago" ADD VALUE 'FACTURADO';

-- AlterTable
ALTER TABLE "facturas" ALTER COLUMN "folio_fiscal" SET NOT NULL,
ALTER COLUMN "folio_fiscal" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "serie" SET NOT NULL,
ALTER COLUMN "folio" SET NOT NULL,
ALTER COLUMN "fecha_timbrado" SET NOT NULL,
ALTER COLUMN "total" SET NOT NULL;
