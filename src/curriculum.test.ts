import { describe, expect, it, vi, afterEach } from "vitest";
import { initialData, checkpoints } from "./data";
import { upgradeCurriculum } from "./curriculum";
import { validate } from "./model";
import { ancestors, unlocked } from "./logic";
import { load } from "./persistence";

function legacy() {
  const data = initialData();
  delete data.curriculumRevision;
  data.skills = data.skills.filter((skill) => skill.id !== "context");
  data.skills.forEach((skill) => {
    skill.prerequisites = skill.prerequisites.filter((id) => id !== "context");
  });
  return data;
}
afterEach(() => vi.unstubAllGlobals());
describe("context engineering curriculum", () => {
  it("requires practical foundations and contributes to the AI checkpoint", () => {
    const data = validate(initialData());
    const context = data.skills.find((skill) => skill.id === "context")!;
    expect(context.projectId).toBe("p4");
    expect(unlocked(context, data.skills)).toBe(false);
    data.skills
      .filter((skill) => context.prerequisites.includes(skill.id))
      .forEach((skill) => {
        skill.status = "Competent";
      });
    expect(unlocked(context, data.skills)).toBe(true);
    expect(
      ancestors(checkpoints[3].requirements, data.skills).has("context"),
    ).toBe(true);
    expect(
      ancestors(checkpoints[2].requirements, data.skills).has("context"),
    ).toBe(false);
  });
  it("upgrades old backups once without losing progress or mutating the original", () => {
    const data = legacy();
    data.skills[0].notes = "My evidence";
    data.skills[0].status = "Competent";
    data.projects[0].deliverables[0].done = true;
    data.activity = [{ text: "Personal history", date: "2026-09-20" }];
    const before = structuredClone(data);
    const next = upgradeCurriculum(validate(data));
    expect(data).toEqual(before);
    expect(next.skills).toHaveLength(93);
    for (const original of before.skills) {
      const updated = next.skills.find((skill) => skill.id === original.id)!;
      expect({ ...updated, prerequisites: original.prerequisites }).toEqual(
        original,
      );
    }
    expect(next.projects).toEqual(before.projects);
    expect(next.activity).toEqual(before.activity);
    expect(next.settings).toEqual(before.settings);
    expect(upgradeCurriculum(next)).toEqual(next);
    next.skills = next.skills.filter((skill) => skill.id !== "context");
    next.skills.forEach((skill) => {
      skill.prerequisites = skill.prerequisites.filter(
        (id) => id !== "context",
      );
    });
    expect(upgradeCurriculum(validate(next)).skills).toHaveLength(92);
  });
  it("respects custom dependencies and avoids cycles in edited built-in graphs", () => {
    const data = legacy();
    data.skills.find((skill) => skill.id === "aisolution")!.prerequisites = [
      "llm",
    ];
    data.skills
      .find((skill) => skill.id === "rag")!
      .prerequisites.push("agents");
    const next = upgradeCurriculum(validate(data));
    expect(
      next.skills.find((skill) => skill.id === "agents")!.prerequisites,
    ).toEqual(["tools"]);
    expect(
      next.skills.find((skill) => skill.id === "aisolution")!.prerequisites,
    ).toEqual(["llm"]);
    expect(() => validate(next)).not.toThrow();
  });
  it("preserves colliding IDs and handles reduced custom backups without broken references", () => {
    const data = legacy();
    data.skills.push({
      ...data.skills[0],
      id: "context",
      custom: true,
      notes: "Keep this",
    });
    expect(upgradeCurriculum(data).skills).toEqual(data.skills);
    const minimal = {
      ...legacy(),
      skills: [{ ...data.skills[0], prerequisites: [], projectId: undefined }],
      projects: [],
    };
    expect(upgradeCurriculum(validate(minimal)).skills).toEqual(minimal.skills);
    const noProjects = legacy();
    noProjects.projects = [];
    noProjects.skills.forEach((skill) => delete skill.projectId);
    expect(
      upgradeCurriculum(noProjects).skills.find(
        (skill) => skill.id === "context",
      )!.projectId,
    ).toBeUndefined();
  });
  it("loads both desktop and browser legacy data with the new curriculum", async () => {
    const raw = JSON.stringify(legacy());
    vi.stubGlobal("window", { desktop: { load: async () => raw } });
    expect((await load())!.skills.some((skill) => skill.id === "context")).toBe(
      true,
    );
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", { getItem: () => raw });
    expect((await load())!.curriculumRevision).toBe(1);
  });
});
