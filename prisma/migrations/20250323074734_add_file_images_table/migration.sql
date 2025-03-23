-- CreateTable
CREATE TABLE "file_images" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "image_path" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "status" "user_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "file_images" ADD CONSTRAINT "file_images_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
