import express from "express";
import multer from "multer";
import { Pin } from "../models/Pin.js";
import { Media } from "../models/Media.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Create a pin (with optional media files)
router.post("/", upload.array("media"), async (req, res) => {
  try {
    console.log(req.body)
    // Create a new Pin using fields from req.body (they come in as text)
    const { username, title, desc, rating, lat, lng } = req.body;
    const newPin = new Pin({ username, title, desc, rating, lat, lng });
    const savedPin = await newPin.save();

    // If files were uploaded, they will be in req.files
    if (req.files && req.files.length > 0) {
      const mediaPromises = req.files.map(async (file) => {
        // Determine the media type based on the MIME type
        let mediaType = "image";
        if (file.mimetype.startsWith("video/")) {
          mediaType = "video";
        } else if (file.mimetype === "application/pdf") {
          mediaType = "pdf";
        } else if (file.mimetype.startsWith("text/")) {
          mediaType = "docs";
        }
        // Create a new Media document with the file buffer
        const newMedia = new Media({
          pin: savedPin._id,
          fileName: file.originalname,
          fileData: file.buffer,
          contentType: file.mimetype,
          type: mediaType,
        });
        const savedMedia = await newMedia.save();
        return savedMedia._id;
      });

      // Wait for all media to be saved and update the pin
      const mediaIds = await Promise.all(mediaPromises);
      savedPin.medias = mediaIds;
      await savedPin.save();
    }

    res.status(200).json(savedPin);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all pins (populating media files)
router.get("/", async (req, res) => {
  try {
    // Populate the 'medias' field with the related media documents
    const pins = await Pin.find().populate("medias");
    res.status(200).json(pins);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get a single pin by ID (with media)
router.get("/:id", async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id).populate("medias");
    if (!pin) return res.status(404).json({ message: "Pin not found" });
    res.status(200).json(pin);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a pin (and optionally update its media links)
router.put("/:id", upload.array("media"), async (req, res) => {
  try {
    // Update the pin fields
    let updatedPin = await Pin.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // If new files are uploaded, process them
    if (req.files && req.files.length > 0) {
      // Remove existing media linked to this pin
      await Media.deleteMany({ pin: req.params.id });

      // Create new media documents
      const mediaPromises = req.files.map(async (file) => {
        let mediaType = "image";
        if (file.mimetype.startsWith("video/")) {
          mediaType = "video";
        } else if (file.mimetype === "application/pdf") {
          mediaType = "pdf";
        } else if (file.mimetype.startsWith("text/")) {
          mediaType = "docs";
        }
        const newMedia = new Media({
          pin: req.params.id,
          fileName: file.originalname,
          fileData: file.buffer,
          contentType: file.mimetype,
          type: mediaType,
        });
        const savedMedia = await newMedia.save();
        return savedMedia._id;
      });
      const mediaIds = await Promise.all(mediaPromises);
      updatedPin.medias = mediaIds;
      await updatedPin.save();
    }

    // Populate medias before sending the response
    updatedPin = await Pin.findById(updatedPin._id).populate("medias");
    res.status(200).json(updatedPin);
  } catch (err) {
    res.status(500).json(err);
  }
});


// Delete a pin (and its associated media)
router.delete("/:id", async (req, res) => {
  try {
    // Remove the pin document
    await Pin.findByIdAndDelete(req.params.id);
    // Also remove all media documents linked to this pin
    await Media.deleteMany({ pin: req.params.id });
    res.status(200).json({ message: "Pin and related media deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
