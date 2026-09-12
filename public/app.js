const TOOLS = {
  "remove-background": {
    name: "Remover Fundo de Imagem",
    title: "Converta seu arquivo",
    subtitle: "Envie uma imagem para remover o fundo automaticamente.",
    hint: "Suporta arrastar e soltar &middot; JPEG, PNG, WEBP &middot; até 15MB",
    inputType: "file",
    fileText: "Arraste uma imagem aqui ou clique para selecionar",
    actionLabel: "Remover fundo",
  },
  "download-video": {
    name: "Baixar Vídeo",
    title: "Converta seu arquivo",
    subtitle: "Cole o link de um vídeo para baixá-lo no formato que preferir.",
    hint: "Cole um link http:// ou https:// &middot; pode levar alguns minutos",
    inputType: "link",
    actionLabel: "Baixar vídeo",
  },
};

const root = document.documentElement;
const toolSwitcherBtn = document.getElementById("toolSwitcherBtn");
const toolMenu = document.getElementById("toolMenu");
const currentToolName = document.getElementById("currentToolName");
const toolItems = document.querySelectorAll(".tool-item");

const toolTitle = document.getElementById("toolTitle");
const toolSubtitle = document.getElementById("toolSubtitle");
const toolHint = document.getElementById("toolHint");
const fieldFile = document.getElementById("fieldFile");
const fieldLink = document.getElementById("fieldLink");
const fileInput = document.getElementById("fileInput");
const fileFieldText = document.getElementById("fileFieldText");
const linkInput = document.getElementById("linkInput");
const videoQuality = document.getElementById("videoQuality");
const actionBtn = document.getElementById("actionBtn");
const toolForm = document.getElementById("toolForm");
const statusArea = document.getElementById("statusArea");
const previewArea = document.getElementById("previewArea");

const themeToggle = document.getElementById("themeToggle");
const iconSun = document.getElementById("iconSun");
const iconMoon = document.getElementById("iconMoon");

let currentTool = "remove-background";
let selectedFile = null;

function applyTool(toolId) {
  currentTool = toolId;
  const tool = TOOLS[toolId];

  root.setAttribute("data-tool", toolId);
  currentToolName.textContent = tool.name;
  toolTitle.textContent = tool.title;
  toolSubtitle.textContent = tool.subtitle;
  toolHint.innerHTML = tool.hint;
  actionBtn.textContent = tool.actionLabel;

  toolItems.forEach((item) => {
    item.dataset.active = item.dataset.tool === toolId ? "true" : "false";
  });

  const isFile = tool.inputType === "file";
  fieldFile.hidden = !isFile;
  fieldLink.hidden = isFile;
  videoQuality.hidden = isFile;

  if (isFile) {
    fileFieldText.textContent = tool.fileText;
  } else {
    linkInput.value = "";
  }

  selectedFile = null;
  fileInput.value = "";
  statusArea.textContent = "";
  previewArea.innerHTML = "";
}

function closeToolMenu() {
  toolMenu.hidden = true;
  toolSwitcherBtn.setAttribute("aria-expanded", "false");
}

toolSwitcherBtn.addEventListener("click", () => {
  const isOpen = !toolMenu.hidden;
  toolMenu.hidden = isOpen;
  toolSwitcherBtn.setAttribute("aria-expanded", String(!isOpen));
});

toolItems.forEach((item) => {
  item.addEventListener("click", () => {
    applyTool(item.dataset.tool);
    closeToolMenu();
  });
});

document.addEventListener("click", (e) => {
  if (!toolMenu.hidden && !toolMenu.contains(e.target) && !toolSwitcherBtn.contains(e.target)) {
    closeToolMenu();
  }
});

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  iconSun.hidden = theme === "dark";
  iconMoon.hidden = theme !== "dark";
  try {
    localStorage.setItem("huball-theme", theme);
  } catch {
    /* ignore unavailable storage */
  }
}

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
});

(function initTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem("huball-theme");
  } catch {
    /* ignore unavailable storage */
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(stored ?? (prefersDark ? "dark" : "light"));
})();

fieldFile.addEventListener("click", () => fileInput.click());

fieldFile.addEventListener("dragover", (e) => {
  e.preventDefault();
  fieldFile.classList.add("dragover");
});

fieldFile.addEventListener("dragleave", () => fieldFile.classList.remove("dragover"));

fieldFile.addEventListener("drop", (e) => {
  e.preventDefault();
  fieldFile.classList.remove("dragover");
  if (e.dataTransfer.files.length) setSelectedFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length) setSelectedFile(fileInput.files[0]);
});

function setSelectedFile(file) {
  selectedFile = file;
  fileFieldText.textContent = file.name;
}

toolForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (currentTool === "remove-background") {
    await runRemoveBackground();
  } else {
    await runDownloadVideo();
  }
});

async function runRemoveBackground() {
  if (!selectedFile) {
    statusArea.textContent = "Selecione uma imagem primeiro.";
    return;
  }

  previewArea.innerHTML = "";
  statusArea.textContent = "Processando... (pode levar alguns segundos)";
  actionBtn.disabled = true;

  const formData = new FormData();
  formData.append("image", selectedFile);

  try {
    const response = await fetch("/api/tools/remove-background", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Erro ao processar imagem.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    statusArea.textContent = "Pronto!";
    previewArea.innerHTML = `
      <img src="${url}" alt="Imagem sem fundo" />
      <a href="${url}" download="sem-fundo.png">Baixar imagem</a>
    `;
  } catch (err) {
    statusArea.textContent = err.message;
  } finally {
    actionBtn.disabled = false;
  }
}

async function runDownloadVideo() {
  const url = linkInput.value.trim();
  if (!/^https?:\/\//i.test(url)) {
    statusArea.textContent = "Informe uma URL válida (http:// ou https://).";
    return;
  }

  previewArea.innerHTML = "";
  statusArea.textContent = "Baixando... (pode levar alguns minutos)";
  actionBtn.disabled = true;

  try {
    const response = await fetch("/api/tools/download-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, quality: videoQuality.value }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Erro ao baixar video.");
    }

    const disposition = response.headers.get("Content-Disposition") || "";
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : "video";

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    statusArea.textContent = "Pronto!";
    previewArea.innerHTML = `<a href="${blobUrl}" download="${filename}">Baixar arquivo</a>`;
  } catch (err) {
    statusArea.textContent = err.message;
  } finally {
    actionBtn.disabled = false;
  }
}

applyTool(currentTool);
