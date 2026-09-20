import { validate, type Data } from "./model";
import { contextEngineering } from "./contextCurriculum";

/** Apply an additive curriculum update once, preserving personal learning records. */
export function upgradeCurriculum(input: Data): Data {
  if (input.curriculumRevision === 1) return input;
  const data = structuredClone(input);
  const existing = data.skills.find((skill) => skill.id === "context");
  // A custom ID collision or a reduced/custom graph must not be overwritten.
  if (
    existing ||
    !contextEngineering.prerequisites.every((id) =>
      data.skills.some((skill) => skill.id === id),
    )
  ) {
    return validate({ ...data, curriculumRevision: 1 });
  }
  const addition = structuredClone(contextEngineering);
  if (!data.projects.some((project) => project.id === addition.projectId))
    delete addition.projectId;
  const position = data.skills.findIndex((skill) => skill.id === "agents");
  data.skills.splice(position < 0 ? data.skills.length : position, 0, addition);
  const previous: Record<string, string[]> = {
    agents: ["tools"],
    aisolution: ["eval", "aitest", "aiprocess"],
    projectai: ["projectauto", "aiauto", "aitest"],
  };
  for (const skill of data.skills) {
    const deps = previous[skill.id];
    if (
      !skill.custom &&
      deps &&
      deps.length === skill.prerequisites.length &&
      deps.every((id) => skill.prerequisites.includes(id))
    ) {
      // Customized prerequisite graphs can contain back-edges absent in the seed.
      const candidate = structuredClone(data);
      candidate.skills
        .find((item) => item.id === skill.id)!
        .prerequisites.push("context");
      try {
        validate(candidate);
        skill.prerequisites.push("context");
      } catch {
        /* Preserve the valid custom graph. */
      }
    }
  }
  return validate({ ...data, curriculumRevision: 1 });
}
