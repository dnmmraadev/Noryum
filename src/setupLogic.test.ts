import { describe, it, expect } from "vitest";
import { initialData } from "./data";
import { validate } from "./model";
import { unlocked } from "./logic";
import { applySetup, recommendFirstSkill } from "./setupLogic";

describe("guided setup", () => {
  it("accepts previous backups without an onboarding field", () => {
    const data = initialData();
    expect(validate(JSON.parse(JSON.stringify(data)))).toEqual(data);
    expect(data.settings.onboarding).toBeUndefined();
  });
  it("persists preferences while preserving every learning record", () => {
    const data = initialData();
    data.skills[0].notes = "Personal evidence";
    data.skills[0].status = "Competent";
    data.projects[0].deliverables[0].done = true;
    const snapshot = structuredClone(data);
    const next = applySetup(data, {
      focus: "Automation",
      hoursPerDay: 2,
      daysPerWeek: 4,
    });
    expect(next.settings).toMatchObject({
      hoursPerDay: 2,
      daysPerWeek: 4,
      onboarding: { completed: true, focus: "Automation" },
    });
    expect(next.skills).toEqual(snapshot.skills);
    expect(next.projects).toEqual(snapshot.projects);
    expect(next.activity).toEqual(snapshot.activity);
    expect(data).toEqual(snapshot);
    expect(validate(JSON.parse(JSON.stringify(next)))).toEqual(next);
  });
  it("recommends an available prerequisite when the chosen area is not ready", () => {
    const data = initialData();
    const first = recommendFirstSkill(data, "Automation")!;
    expect(unlocked(first, data.skills)).toBe(true);
    expect(first.status).toBe("Not started");
    expect(recommendFirstSkill(data, "Applied AI")?.branch).toBe("Applied AI");
    data.skills.forEach((skill) => (skill.status = "Competent"));
    expect(recommendFirstSkill(data, "all")).toBeUndefined();
  });
  it("rejects invalid pace settings instead of saving unusable plans", () => {
    for (const hours of [0, NaN, 17])
      expect(() =>
        applySetup(initialData(), {
          focus: "all",
          hoursPerDay: hours,
          daysPerWeek: 5,
        }),
      ).toThrow();
    expect(() =>
      applySetup(initialData(), {
        focus: "all",
        hoursPerDay: 1,
        daysPerWeek: 2.5,
      }),
    ).toThrow();
  });
});
