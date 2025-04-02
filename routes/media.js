import express from "express";
import { Media } from "../models/Media.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });
    res.set("Content-Type", media.contentType);
    res.set("Content-Disposition", `attachment; filename="${media.fileName}"`);
    res.send(media.fileData);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;