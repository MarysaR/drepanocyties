-- CreateEnum
CREATE TYPE "ReplyLength" AS ENUM ('SHORT', 'BALANCED', 'DETAILED');

-- CreateEnum
CREATE TYPE "MessageAuthor" AS ENUM ('PERSON', 'TWIN');

-- CreateEnum
CREATE TYPE "MemoryOrigin" AS ENUM ('TWIN_PROPOSAL', 'PERSON_MESSAGE', 'WRITTEN_BY_PERSON');

-- CreateEnum
CREATE TYPE "SuppressionReason" AS ENUM ('REJECTED', 'CORRECTED', 'DELETED');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('CALM', 'JOYFUL', 'GRATEFUL', 'TIRED', 'WORRIED', 'SAD', 'ANGRY', 'OVERWHELMED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('AI_PROCESSING', 'PERSISTENT_MEMORY');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "auth_provider" VARCHAR(32) NOT NULL,
    "auth_subject" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "user_id" UUID NOT NULL,
    "preferred_name_encrypted" TEXT,
    "about_me_encrypted" TEXT,
    "reply_length" "ReplyLength" NOT NULL DEFAULT 'BALANCED',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title_encrypted" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "author" "MessageAuthor" NOT NULL,
    "content_encrypted" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memories" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content_encrypted" TEXT NOT NULL,
    "content_fingerprint" CHAR(64) NOT NULL,
    "origin" "MemoryOrigin" NOT NULL,
    "source_message_id" UUID,
    "consented_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_proposals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content_encrypted" TEXT NOT NULL,
    "content_fingerprint" CHAR(64) NOT NULL,
    "source_message_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_suppressions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content_fingerprint" CHAR(64) NOT NULL,
    "source_message_id" UUID,
    "reason" "SuppressionReason" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_suppressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title_encrypted" TEXT,
    "content_encrypted" TEXT NOT NULL,
    "mood" "Mood",
    "entry_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_decisions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "policy_version" VARCHAR(32) NOT NULL,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_provider_auth_subject_key" ON "users"("auth_provider", "auth_subject");

-- CreateIndex
CREATE INDEX "conversations_user_id_last_activity_at_idx" ON "conversations"("user_id", "last_activity_at" DESC);

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_user_id_idx" ON "messages"("user_id");

-- CreateIndex
CREATE INDEX "memories_user_id_created_at_idx" ON "memories"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "memories_user_id_content_fingerprint_key" ON "memories"("user_id", "content_fingerprint");

-- CreateIndex
CREATE INDEX "memory_proposals_user_id_created_at_idx" ON "memory_proposals"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "memory_proposals_user_id_content_fingerprint_key" ON "memory_proposals"("user_id", "content_fingerprint");

-- CreateIndex
CREATE INDEX "memory_suppressions_user_id_content_fingerprint_idx" ON "memory_suppressions"("user_id", "content_fingerprint");

-- CreateIndex
CREATE INDEX "memory_suppressions_user_id_source_message_id_idx" ON "memory_suppressions"("user_id", "source_message_id");

-- CreateIndex
CREATE INDEX "journal_entries_user_id_entry_date_idx" ON "journal_entries"("user_id", "entry_date" DESC);

-- CreateIndex
CREATE INDEX "consent_decisions_user_id_type_decided_at_idx" ON "consent_decisions"("user_id", "type", "decided_at" DESC);

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_source_message_id_fkey" FOREIGN KEY ("source_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_proposals" ADD CONSTRAINT "memory_proposals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_proposals" ADD CONSTRAINT "memory_proposals_source_message_id_fkey" FOREIGN KEY ("source_message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_suppressions" ADD CONSTRAINT "memory_suppressions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_decisions" ADD CONSTRAINT "consent_decisions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
