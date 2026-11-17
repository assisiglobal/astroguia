import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function apiRoot(): string {
  return API_ROOT;
}

/** Lee api/.env sin pisar variables que ya vinieron del entorno. */
export function loadEnv(): void {
  const file = path.join(API_ROOT, ".env");
  if (!existsSync(file)) return;
  const text = readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function openAiKey(): string {
  return (process.env.OPENAI_API_KEY ?? "").trim();
}
