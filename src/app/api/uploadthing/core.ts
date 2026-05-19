import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({ 
    image: { maxFileSize: "128MB", maxFileCount: 1 }, 
    video: { maxFileSize: "1GB", maxFileCount: 1 } 
  })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for url:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
