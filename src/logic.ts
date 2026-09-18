import type { Data, Skill, Checkpoint } from "./model";
export const mastered = (s: Skill) => s.status === "Competent";
export const resolved = (s: Skill) => mastered(s) || s.status === "Skipped";
export function unlocked(s: Skill, skills: Skill[]) {
  return s.prerequisites.every((id) =>
    skills.some((p) => p.id === id && resolved(p)),
  );
}
export function ancestors(ids: string[], skills: Skill[]): Set<string> {
  const result = new Set<string>();
  const visit = (id: string) => {
    if (result.has(id)) return;
    result.add(id);
    skills.find((s) => s.id === id)?.prerequisites.forEach(visit);
  };
  ids.forEach(visit);
  return result;
}
export function progress(skills: Skill[]) {
  return skills.length
    ? Math.round((skills.filter(mastered).length / skills.length) * 100)
    : 0;
}
export function remaining(skills: Skill[]) {
  return skills
    .filter((s) => !resolved(s))
    .reduce((sum, s) => sum + s.hours, 0);
}
export function readiness(c: Checkpoint, d: Data) {
  const ids = ancestors(c.requirements, d.skills);
  const skills = d.skills.filter((s) => ids.has(s.id));
  const done =
    skills.filter(mastered).length +
    d.projects.filter(
      (p) =>
        c.projects.includes(p.id) &&
        p.status === "Competent" &&
        p.deliverables.every((x) => x.done),
    ).length;
  return {
    skills,
    missing: skills.filter((s) => !mastered(s)),
    percent: Math.round((done / (skills.length + c.projects.length)) * 100),
    weeks: Math.ceil(
      skills.filter((s) => !mastered(s)).reduce((n, s) => n + s.hours, 0) /
        (d.settings.hoursPerDay * d.settings.daysPerWeek),
    ),
  };
}
export function plan(skills: Skill[]) {
  const active = skills.filter((s) => !resolved(s));
  const rank = { High: 0, Medium: 1, Low: 2 };
  active.sort(
    (a, b) =>
      Number(b.status === "Learning" || b.status === "Practicing") -
        Number(a.status === "Learning" || a.status === "Practicing") ||
      rank[a.priority] - rank[b.priority] ||
      a.title.localeCompare(b.title),
  );
  const now = active.filter((s) => unlocked(s, skills));
  const after = active.filter(
    (s) =>
      !unlocked(s, skills) &&
      s.prerequisites.every((id) =>
        skills.some((p) => p.id === id && (resolved(p) || unlocked(p, skills))),
      ),
  );
  return {
    Now: now,
    Next: after,
    Later: active.filter((s) => !now.includes(s) && !after.includes(s)),
  };
}
