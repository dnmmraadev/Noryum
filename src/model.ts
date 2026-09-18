import { z } from "zod";
export const branches = [
  "Foundations",
  "Business Analysis",
  "Data Analytics",
  "Python & APIs",
  "Automation",
  "Applied AI",
  "English & Career",
] as const;
export const statuses = [
  "Not started",
  "Learning",
  "Practicing",
  "Competent",
  "Skipped",
] as const;
export const colors = [
  "#94a3b8",
  "#5b9bff",
  "#46c798",
  "#57bdd1",
  "#eeac63",
  "#ad86ef",
  "#e48bb8",
];
const resource = z.object({
  title: z.string().max(300),
  url: z
    .string()
    .url()
    .refine((v) => /^https?:\/\//.test(v)),
});
export const skillSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  branch: z.enum(branches),
  status: z.enum(statuses),
  priority: z.enum(["High", "Medium", "Low"]),
  hours: z.number().min(0.5).max(1000),
  prerequisites: z.array(z.string()),
  objective: z.string(),
  criteria: z.array(z.string()),
  evidence: z.string(),
  notes: z.string(),
  resources: z.array(resource),
  custom: z.boolean(),
  projectId: z.string().optional(),
});
const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(statuses),
  notes: z.string(),
  links: z.string(),
  github: z.string(),
  start: z.string(),
  end: z.string(),
  deliverables: z.array(z.object({ title: z.string(), done: z.boolean() })),
  requirements: z.array(z.string()),
});
export const schema = z.object({
  version: z.literal(1),
  skills: z.array(skillSchema).min(1).max(1000),
  projects: z.array(projectSchema),
  settings: z.object({
    hoursPerDay: z.number().min(0.5).max(16),
    daysPerWeek: z.number().int().min(1).max(7),
    theme: z.enum(["dark", "light"]),
  }),
  activity: z.array(z.object({ text: z.string(), date: z.string() })).max(100),
});
export type Skill = z.infer<typeof skillSchema>;
export type Data = z.infer<typeof schema>;
export type Project = Data["projects"][number];
export type Checkpoint = {
  id: string;
  title: string;
  weeks: string;
  roles: string[];
  requirements: string[];
  projects: string[];
};
export function validate(input: unknown): Data {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(
      `Invalid backup field "${issue.path.join(".") || "root"}": ${issue.message}`,
    );
  }
  const data = parsed.data;
  const ids = new Set(data.skills.map((s) => s.id));
  if (ids.size !== data.skills.length) throw Error("Duplicate competency IDs.");
  const visiting = new Set<string>(),
    visited = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) throw Error("Dependencies contain a cycle.");
    if (visited.has(id)) return;
    visiting.add(id);
    const s = data.skills.find((s) => s.id === id)!;
    for (const p of s.prerequisites) {
      if (!ids.has(p)) throw Error("Missing prerequisite: " + p);
      visit(p);
    }
    visiting.delete(id);
    visited.add(id);
  }
  data.skills.forEach((s) => visit(s.id));
  if (new Set(data.projects.map((p) => p.id)).size !== data.projects.length)
    throw Error("Duplicate project IDs.");
  if (data.projects.some((p) => p.requirements.some((id) => !ids.has(id))))
    throw Error("Missing project requirement.");
  if (
    data.skills.some(
      (s) => s.projectId && !data.projects.some((p) => p.id === s.projectId),
    )
  )
    throw Error("Missing linked project.");
  return data;
}
