CREATE SCHEMA IF NOT EXISTS "auth";
CREATE SCHEMA IF NOT EXISTS "market";
CREATE SCHEMA IF NOT EXISTS "agent";
CREATE SCHEMA IF NOT EXISTS "trading";
CREATE SCHEMA IF NOT EXISTS "payment";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalog";

-- CreateTable
CREATE TABLE "catalog"."CardVariant" (
    "id" UUID NOT NULL,
    "game" TEXT NOT NULL DEFAULT 'POKEMON',
    "name" TEXT NOT NULL,
    "setCode" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "edition" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "CardVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CardVariant_name_idx" ON "catalog"."CardVariant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CardVariant_game_setCode_cardNumber_language_edition_condit_key" ON "catalog"."CardVariant"("game", "setCode", "cardNumber", "language", "edition", "condition");
