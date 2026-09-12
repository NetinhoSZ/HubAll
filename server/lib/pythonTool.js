import { execFile } from "node:child_process";
import path from "node:path";

const TOOLS_DIR = path.resolve(import.meta.dirname, "..", "..", "tools");

const VENV_PYTHON = process.platform === "win32" ? path.join("venv", "Scripts", "python.exe") : path.join("venv", "bin", "python");

export function runPythonTool(toolName, scriptName, args, options = {}) {
  const toolDir = path.join(TOOLS_DIR, toolName);
  const pythonBin = path.join(toolDir, VENV_PYTHON);
  const scriptPath = path.join(toolDir, scriptName);
  const modelsCacheDir = path.join(toolDir, ".model-cache");

  return new Promise((resolve, reject) => {
    execFile(
      pythonBin,
      [scriptPath, ...args],
      {
        timeout: options.timeout ?? 120_000,
        maxBuffer: 1024 * 1024 * 20,
        env: { ...process.env, U2NET_HOME: modelsCacheDir },
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr?.trim() || error.message));
          return;
        }
        resolve({ stdout, stderr });
      }
    );
  });
}
