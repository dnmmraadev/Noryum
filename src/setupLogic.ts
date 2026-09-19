import { ancestors, plan } from "./logic";
import { validate, type Data } from "./model";
export type SetupFocus = NonNullable<Data["settings"]["onboarding"]>["focus"];
export type SetupPreferences = {
  focus: SetupFocus;
  hoursPerDay: number;
  daysPerWeek: number;
};
export function recommendFirstSkill(data: Data, focus: SetupFocus) {
  const available = plan(data.skills).Now;
  if (focus === "all") return available[0];
  const direct = available.find((skill) => skill.branch === focus);
  if (direct) return direct;
  const target = data.skills.filter(
    (skill) =>
      skill.branch === focus &&
      !["Competent", "Skipped"].includes(skill.status),
  );
  const prerequisites = ancestors(
    target.map((skill) => skill.id),
    data.skills,
  );
  return available.find((skill) => prerequisites.has(skill.id)) || available[0];
}
export function applySetup(data: Data, preferences: SetupPreferences): Data {
  return validate({
    ...data,
    settings: {
      ...data.settings,
      hoursPerDay: preferences.hoursPerDay,
      daysPerWeek: preferences.daysPerWeek,
      onboarding: { completed: true, focus: preferences.focus },
    },
  });
}
