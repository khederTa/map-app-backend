import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    // Reference to the parent Pin
    pin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pin",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    // Instead of storing the URL, store the file data directly
    fileData: {
      type: Buffer,
      required: true,
    },
    // Store the MIME type (e.g. "image/png", "video/mp4")
    contentType: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "pdf", "docs"],
      default: "image",
    },
  },
  { timestamps: true }
);

export const Media = mongoose.model("Media", MediaSchema);
