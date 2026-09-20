import { validate, type Data } from "./model";
import { upgradeCurriculum } from "./curriculum";
declare global {
  interface Window {
    desktop?: {
      load: () => Promise<string | null>;
      save: (text: string) => Promise<void>;
    };
  }
}
export async function load() {
  const raw = window.desktop
    ? await window.desktop.load()
    : localStorage.getItem("career-roadmap-v1");
  return raw ? upgradeCurriculum(validate(JSON.parse(raw))) : null;
}
export async function save(data: Data) {
  const text = JSON.stringify(data, null, 2);
  if (window.desktop) await window.desktop.save(text);
  else localStorage.setItem("career-roadmap-v1", text);
}
export function exportData(data: Data) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "noryum-backup.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
