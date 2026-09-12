import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { runPythonTool } from "../lib/pythonTool.js";

const STORAGE_DIR = path.resolve(import.meta.dirname, "..", "..", "storage");
const UPLOADS_DIR = path.join(STORAGE_DIR, "uploads");
const OUTPUTS_DIR = path.join(STORAGE_DIR, "outputs");

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();

router.post("/remove-background", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Envie um arquivo de imagem (jpeg, png ou webp)." });
    return;
  }

  const jobId = crypto.randomUUID();
  const inputPath = req.file.path;
  const outputPath = path.join(OUTPUTS_DIR, `${jobId}.png`);

  try {
    await runPythonTool("remove-background", "remove_bg.py", [inputPath, outputPath]);
    res.sendFile(outputPath, async (err) => {
      await fs.rm(inputPath, { force: true });
      await fs.rm(outputPath, { force: true });
      if (err && !res.headersSent) {
        res.status(500).json({ error: "Falha ao enviar imagem processada." });
      }
    });
  } catch (error) {
    await fs.rm(inputPath, { force: true });
    res.status(500).json({ error: "Falha ao remover fundo da imagem.", details: error.message });
  }
});

export default router;
