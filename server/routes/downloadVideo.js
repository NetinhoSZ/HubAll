import { Router } from "express";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { runPythonTool } from "../lib/pythonTool.js";

const STORAGE_DIR = path.resolve(import.meta.dirname, "..", "..", "storage");
const OUTPUTS_DIR = path.join(STORAGE_DIR, "outputs");

const ALLOWED_QUALITIES = new Set(["best", "1080p", "720p", "audio"]);

const router = Router();

router.post("/download-video", async (req, res) => {
  const { url, quality } = req.body ?? {};

  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    res.status(400).json({ error: "Informe uma URL valida (http:// ou https://)." });
    return;
  }

  const selectedQuality = ALLOWED_QUALITIES.has(quality) ? quality : "best";
  const jobId = crypto.randomUUID();

  try {
    await runPythonTool(
      "download-video",
      "download_video.py",
      [url, selectedQuality, OUTPUTS_DIR, jobId],
      { timeout: 10 * 60_000 }
    );

    const match = (await fs.readdir(OUTPUTS_DIR)).find((name) => name.startsWith(jobId));
    if (!match) {
      res.status(500).json({ error: "Download nao gerou arquivo de saida." });
      return;
    }

    const outputPath = path.join(OUTPUTS_DIR, match);
    res.download(outputPath, match, async (err) => {
      await fs.rm(outputPath, { force: true });
      if (err && !res.headersSent) {
        res.status(500).json({ error: "Falha ao enviar arquivo." });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Falha ao baixar video.", details: error.message });
  }
});

export default router;
