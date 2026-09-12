import express from "express";
import path from "node:path";
import removeBackgroundRouter from "./routes/removeBackground.js";
import downloadVideoRouter from "./routes/downloadVideo.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.resolve(import.meta.dirname, "..", "public")));
app.use("/api/tools", removeBackgroundRouter);
app.use("/api/tools", downloadVideoRouter);

app.listen(PORT, () => {
  console.log(`HubAll rodando em http://localhost:${PORT}`);
});
