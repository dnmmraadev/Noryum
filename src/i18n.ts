import { useSyncExternalStore } from "react";
import { initialData } from "./data";
import type { Skill, Project } from "./model";
import spanish from "./locales/es-419.json";

export type Language = "en" | "es-419";
const catalog: Record<string, string> = spanish;
const preferenceKey = "noryum-language";
let language: Language = "en";
try {
  if (localStorage.getItem(preferenceKey) === "es-419") language = "es-419";
} catch {
  /* Language switching also works without browser storage. */
}
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function setLanguage(next: Language) {
  language = next;
  try {
    localStorage.setItem(preferenceKey, next);
  } catch {
    /* Optional preference persistence. */
  }
  document.documentElement.lang = next;
  listeners.forEach((listener) => listener());
}
if (typeof document !== "undefined") document.documentElement.lang = language;

export function translateText(text: string, locale: Language): string {
  if (locale === "en") return text;
  const key = text.trim();
  const exact = catalog[key];
  if (exact !== undefined) return text.replace(key, exact);
  const translate = (value: string) => translateText(value, locale);
  let match: RegExpMatchArray | null;
  if ((match = key.match(/^(\d+) competencies$/)))
    return `${match[1]} competencias`;
  if ((match = key.match(/^(\d+) pixels$/))) return `${match[1]} píxeles`;
  if ((match = key.match(/^(\d+)\. (.+)$/)))
    return `${match[1]}. ${translate(match[2])}`;
  if ((match = key.match(/^(\d+)% ready · (.+) weeks\*$/)))
    return `${match[1]}% de preparación · ${match[2]} semanas*`;
  if ((match = key.match(/^(.+) → (.+)$/)))
    return `${translate(match[1])} → ${translate(match[2])}`;
  if ((match = key.match(/^Remove (.+)$/))) return `Eliminar ${match[1]}`;
  if (
    (match = key.match(
      /^Replace your current roadmap with (\d+) competencies and (\d+) projects\? Export a backup first if needed\.$/,
    ))
  )
    return `¿Reemplazar el mapa actual con ${match[1]} competencias y ${match[2]} proyectos? Exporta primero una copia de seguridad si necesitas conservar tus datos.`;
  const prefixes: [string, string][] = [
    [
      "Local data could not be loaded. Your existing file has not been overwritten. ",
      "No se pudieron cargar los datos locales. El archivo existente no se ha sobrescrito. ",
    ],
    [
      "Unable to save. Export a backup before closing. ",
      "No se pudo guardar. Exporta una copia de seguridad antes de cerrar. ",
    ],
    [
      "Import rejected. No data was changed. ",
      "Importación rechazada. No se modificaron los datos. ",
    ],
    ["Missing prerequisite: ", "Falta un prerrequisito: "],
  ];
  for (const [source, target] of prefixes)
    if (text.startsWith(source))
      return target + translate(text.slice(source.length));
  if (key.startsWith("Invalid backup field "))
    return "La copia de seguridad contiene un campo no válido. Revisa su estructura y los valores permitidos.";
  if (key.includes("JSON") && /Unexpected|Expected|position|token/i.test(key))
    return "El archivo no contiene un documento JSON válido.";
  return text;
}
function translator(locale: Language) {
  return <T>(value: T): T =>
    (typeof value === "string" ? translateText(value, locale) : value) as T;
}
const translators = { en: translator("en"), "es-419": translator("es-419") };
export function useTranslation() {
  const current = useSyncExternalStore(subscribe, () => language);
  return { language: current, setLanguage, t: translators[current] };
}

const original = initialData();
const originalSkills = new Map(
  original.skills.map((skill) => [skill.id, skill]),
);
const originalProjects = new Map(
  original.projects.map((project) => [project.id, project]),
);

/** Translate only unchanged built-in content; never reinterpret user-authored text. */
export function skillText(
  skill: Skill | undefined,
  text: string | undefined,
  locale: Language,
): string {
  if (!skill || !text || skill.custom) return text || "";
  const seed = originalSkills.get(skill.id);
  const builtIn =
    seed &&
    [
      seed.title,
      seed.objective,
      seed.evidence,
      ...seed.criteria,
      ...seed.resources.map((resource) => resource.title),
    ].includes(text);
  return builtIn ? translateText(text, locale) : text;
}
export function projectText(
  project: Project,
  text: string,
  locale: Language,
): string {
  const seed = originalProjects.get(project.id);
  return seed &&
    [seed.title, ...seed.deliverables.map((item) => item.title)].includes(text)
    ? translateText(text, locale)
    : text;
}
export function searchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
