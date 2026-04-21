-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OPERADOR', 'CONTADOR', 'VISUALIZADOR', 'CHOFER');

-- CreateEnum
CREATE TYPE "UnidadMedida" AS ENUM ('KG', 'TONELADA', 'PIEZA', 'CAJA', 'COSTAL', 'LITRO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADO', 'CANCELADO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "FormaPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'TARJETA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstatusFactura" AS ENUM ('VIGENTE', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoCorte" AS ENUM ('ABIERTO', 'CERRADO');

-- CreateEnum
CREATE TYPE "AccionAudit" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "telefono" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "nombre_comercial" VARCHAR(200) NOT NULL,
    "razon_social" VARCHAR(200),
    "rfc" VARCHAR(13),
    "regimen_fiscal" VARCHAR(100),
    "uso_cfdi" VARCHAR(10),
    "direccion_calle" VARCHAR(200),
    "direccion_colonia" VARCHAR(100),
    "direccion_ciudad" VARCHAR(100),
    "direccion_estado" VARCHAR(100),
    "codigo_postal" VARCHAR(10),
    "telefono" VARCHAR(20),
    "email" VARCHAR(150),
    "contacto_nombre" VARCHAR(150),
    "dias_credito" INTEGER NOT NULL DEFAULT 0,
    "limite_credito" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" "UnidadMedida" NOT NULL,
    "precio_base" DECIMAL(12,4),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_de_remision" (
    "id" UUID NOT NULL,
    "folio" VARCHAR(20) NOT NULL,
    "cliente_id" UUID NOT NULL,
    "fecha_emision" DATE NOT NULL,
    "fecha_vencimiento" DATE,
    "estado_pago" "EstadoPago" NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "total_pagado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "saldo_pendiente" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "condiciones_pago" TEXT,
    "observaciones" TEXT,
    "firmado_por" VARCHAR(200),
    "entregado_por" UUID,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notas_de_remision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_nota" (
    "id" UUID NOT NULL,
    "nota_id" UUID NOT NULL,
    "producto_id" UUID,
    "descripcion" VARCHAR(300),
    "cantidad" DECIMAL(12,4) NOT NULL,
    "unidad_medida" VARCHAR(20),
    "precio_unitario" DECIMAL(12,4) NOT NULL,
    "descuento_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "items_nota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" UUID NOT NULL,
    "nota_id" UUID NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha_pago" DATE NOT NULL,
    "forma_pago" "FormaPago" NOT NULL,
    "referencia" VARCHAR(100),
    "banco" VARCHAR(100),
    "notas" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" UUID NOT NULL,
    "folio_fiscal" VARCHAR(50),
    "serie" VARCHAR(10),
    "folio" VARCHAR(20),
    "fecha_timbrado" TIMESTAMP(3),
    "subtotal" DECIMAL(12,2),
    "iva" DECIMAL(12,2),
    "total" DECIMAL(12,2),
    "estatus" "EstatusFactura" NOT NULL,
    "xml_url" TEXT,
    "pdf_url" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_facturas" (
    "nota_id" UUID NOT NULL,
    "factura_id" UUID NOT NULL,

    CONSTRAINT "notas_facturas_pkey" PRIMARY KEY ("nota_id","factura_id")
);

-- CreateTable
CREATE TABLE "cortes_mensuales" (
    "id" UUID NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "fecha_corte" TIMESTAMP(3),
    "estado" "EstadoCorte" NOT NULL,
    "total_vendido" DECIMAL(12,2),
    "total_cobrado" DECIMAL(12,2),
    "total_pendiente" DECIMAL(12,2),
    "notas_emitidas" INTEGER,
    "notas_pagadas" INTEGER,
    "notas_pendientes" INTEGER,
    "notas_vencidas" INTEGER,
    "notas_canceladas" INTEGER,
    "resumen_json" JSONB,
    "generado_por" UUID,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cortes_mensuales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "tabla" VARCHAR(50),
    "registro_id" UUID,
    "accion" "AccionAudit" NOT NULL,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "usuario_id" UUID,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "notas_de_remision_folio_key" ON "notas_de_remision"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_folio_fiscal_key" ON "facturas"("folio_fiscal");

-- CreateIndex
CREATE UNIQUE INDEX "cortes_mensuales_anio_mes_key" ON "cortes_mensuales"("anio", "mes");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_de_remision" ADD CONSTRAINT "notas_de_remision_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_de_remision" ADD CONSTRAINT "notas_de_remision_entregado_por_fkey" FOREIGN KEY ("entregado_por") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_de_remision" ADD CONSTRAINT "notas_de_remision_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_de_remision" ADD CONSTRAINT "notas_de_remision_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_nota" ADD CONSTRAINT "items_nota_nota_id_fkey" FOREIGN KEY ("nota_id") REFERENCES "notas_de_remision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_nota" ADD CONSTRAINT "items_nota_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_nota_id_fkey" FOREIGN KEY ("nota_id") REFERENCES "notas_de_remision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_facturas" ADD CONSTRAINT "notas_facturas_nota_id_fkey" FOREIGN KEY ("nota_id") REFERENCES "notas_de_remision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_facturas" ADD CONSTRAINT "notas_facturas_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_mensuales" ADD CONSTRAINT "cortes_mensuales_generado_por_fkey" FOREIGN KEY ("generado_por") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
