import { describe, expect, it } from "vitest";
import { initialData, checkpoints } from "./data";
import { validate } from "./model";
import { projectText, searchText, skillText, translateText } from "./i18n";
import spanish from "./locales/es-419.json";

describe("Latin American Spanish", () => {
  it("covers every built-in learning objective, criterion and project deliverable", () => {
    const data = initialData();
    const content = [
      ...data.skills.flatMap((skill) => [
        skill.title,
        skill.objective,
        skill.evidence,
        ...skill.criteria,
      ]),
      ...data.projects.flatMap((project) => [
        project.title,
        ...project.deliverables.map((item) => item.title),
      ]),
      ...checkpoints.flatMap((checkpoint) => [
        checkpoint.title,
        ...checkpoint.roles,
      ]),
    ];
    for (const text of content) expect(spanish, text).toHaveProperty(text);
  });
  it("preserves personal content and canonical backup data while translating built-ins", () => {
    const data = initialData();
    const before = JSON.stringify(data);
    expect(skillText(data.skills[0], data.skills[0].title, "es-419")).toBe(
      "Fundamentos de negocio",
    );
    expect(
      skillText(
        { ...data.skills[0], custom: true },
        "Business Fundamentals",
        "es-419",
      ),
    ).toBe("Business Fundamentals");
    expect(skillText(data.skills[0], "Learning", "es-419")).toBe("Learning");
    expect(
      projectText(data.projects[0], data.projects[0].title, "es-419"),
    ).toBe("Análisis de procesos de negocio");
    expect(projectText(data.projects[0], "My own project", "es-419")).toBe(
      "My own project",
    );
    expect(JSON.stringify(data)).toBe(before);
    expect(validate(JSON.parse(before))).toEqual(data);
  });
  it("localizes dynamic messages and keeps English available", () => {
    expect(translateText("92 competencies", "es-419")).toBe("92 competencias");
    expect(translateText("Saving…", "en")).toBe("Saving…");
    expect(
      translateText(
        "Import rejected. No data was changed. The file must be smaller than 5 MB.",
        "es-419",
      ),
    ).toBe(
      "Importación rechazada. No se modificaron los datos. El archivo debe ser menor de 5 MB.",
    );
    expect(searchText("Análisis de negocio")).toContain(searchText("analisis"));
  });
});
