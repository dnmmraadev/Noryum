import { describe, it, expect } from "vitest";
import { initialData, checkpoints } from "./data";
import { validate } from "./model";
import { ancestors, plan, progress, readiness, unlocked } from "./logic";
describe("roadmap integrity and planning", () => {
  it("ships the full valid roadmap with independent English and no cycles", () => {
    const d = validate(initialData());
    expect(d.skills.length).toBe(92);
    expect(d.skills.find((s) => s.id === "english")?.prerequisites).toEqual([]);
    expect(d.projects).toHaveLength(5);
  });
  it("unlocks dependent competencies after mastery or skipping without inflating progress", () => {
    const d = initialData();
    const ba = d.skills.find((s) => s.id === "ba")!;
    expect(unlocked(ba, d.skills)).toBe(false);
    d.skills.find((s) => s.id === "business")!.status = "Skipped";
    expect(unlocked(ba, d.skills)).toBe(true);
    expect(progress(d.skills)).toBe(0);
  });
  it("requires all project deliverables for readiness", () => {
    const d = initialData();
    d.skills.forEach((s) => (s.status = "Competent"));
    d.projects.forEach((p) => (p.status = "Competent"));
    expect(readiness(checkpoints[0], d).percent).toBeLessThan(100);
    d.projects[0].deliverables.forEach((x) => (x.done = true));
    expect(readiness(checkpoints[0], d).percent).toBe(100);
  });
  it("does not accept skipped competencies as employment evidence", () => {
    const d = initialData();
    d.skills.forEach((s) => (s.status = "Skipped"));
    expect(readiness(checkpoints[0], d).percent).toBe(0);
  });
  it("keeps the plan deterministic and partitions all unfinished work", () => {
    const d = initialData();
    const p = plan(d.skills);
    expect(p).toEqual(plan(d.skills));
    expect(
      new Set([...p.Now, ...p.Next, ...p.Later].map((s) => s.id)).size,
    ).toBe(d.skills.length);
    expect(p.Now.some((s) => s.id === "english")).toBe(true);
  });
  it("includes cross-branch ancestors in final checkpoint", () => {
    const d = initialData();
    const ids = ancestors(checkpoints[4].requirements, d.skills);
    for (const id of ["ba", "sql", "workflow", "eval", "llm", "rest"])
      expect(ids.has(id)).toBe(true);
  });
  it("recalculates time from the weekly pace", () => {
    const d = initialData();
    const before = readiness(checkpoints[0], d).weeks;
    d.settings.hoursPerDay = 0.5;
    expect(readiness(checkpoints[0], d).weeks).toBeGreaterThan(before);
  });
  it("round-trips complete data without losses", () => {
    const d = initialData();
    d.skills[0].notes = "Evidence attached";
    d.skills[0].status = "Learning";
    d.projects[0].github = "https://github.com/example/project";
    expect(validate(JSON.parse(JSON.stringify(d)))).toEqual(d);
  });
  it("rejects invalid and dangerous backups", () => {
    const d = initialData();
    d.skills[0].prerequisites = ["ba"];
    expect(() => validate(d)).toThrow(/cycle/);
    const missing = initialData();
    missing.skills[0].prerequisites = ["absent"];
    expect(() => validate(missing)).toThrow(/Missing prerequisite/);
    const bad = initialData();
    bad.skills[0].resources = [{ title: "Unsafe", url: "javascript:alert(1)" }];
    expect(() => validate(bad)).toThrow();
    expect(() => validate({})).toThrow();
  });
});
