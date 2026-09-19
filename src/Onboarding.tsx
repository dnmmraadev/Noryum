import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Compass,
  ShieldCheck,
  Target,
  Clock3,
  BookOpen,
  BriefcaseBusiness,
  BarChart3,
  Workflow,
  Sparkles,
} from "lucide-react";
import { branches, type Data } from "./model";
import { useTranslation, skillText } from "./i18n";
import {
  recommendFirstSkill,
  type SetupFocus,
  type SetupPreferences,
} from "./setupLogic";

const draftKey = "noryum-setup-draft-v1";
const steps = ["Welcome", "Your direction", "Your rhythm"];
const choices = [
  [
    "all",
    Compass,
    "Explore the full roadmap",
    "Build a balanced path across business, data and technology.",
  ],
  [
    "Business Analysis",
    BriefcaseBusiness,
    "Business Analysis",
    "Understand needs, improve processes and define better solutions.",
  ],
  [
    "Data Analytics",
    BarChart3,
    "Data Analytics",
    "Turn data into clear insights and informed decisions.",
  ],
  [
    "Automation",
    Workflow,
    "Automation",
    "Create reliable workflows that reduce repetitive work.",
  ],
  [
    "Applied AI",
    Sparkles,
    "Applied AI",
    "Apply AI with evaluation, clear boundaries and human judgment.",
  ],
] as const;
function initialDraft(data: Data, isNew: boolean) {
  const fallback = {
    step: 0,
    focus: data.settings.onboarding?.focus || ("all" as SetupFocus),
    hoursPerDay: data.settings.hoursPerDay,
    daysPerWeek: data.settings.daysPerWeek,
  };
  if (!isNew) return fallback;
  try {
    const stored = JSON.parse(localStorage.getItem(draftKey) || "null");
    if (
      stored &&
      [0, 1, 2].includes(stored.step) &&
      ["all", ...branches].includes(stored.focus) &&
      Number.isFinite(stored.hoursPerDay) &&
      stored.hoursPerDay >= 0.5 &&
      stored.hoursPerDay <= 16 &&
      Number.isInteger(stored.daysPerWeek) &&
      stored.daysPerWeek >= 1 &&
      stored.daysPerWeek <= 7
    )
      return { ...fallback, ...stored } as typeof fallback;
  } catch {
    /* An unavailable or invalid draft never prevents setup. */
  }
  return fallback;
}
export default function Onboarding({
  data,
  isNew,
  onComplete,
  onCancel,
}: {
  data: Data;
  isNew: boolean;
  onComplete: (
    preferences: SetupPreferences,
    skipped: boolean,
  ) => Promise<void>;
  onCancel: () => void;
}) {
  const { t, language, setLanguage } = useTranslation();
  const [draft, setDraft] = useState(() => initialDraft(data, isNew));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus();
  }, [draft.step]);
  useEffect(() => {
    if (
      isNew &&
      Number.isFinite(draft.hoursPerDay) &&
      Number.isFinite(draft.daysPerWeek)
    )
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft));
      } catch {
        /* Draft persistence is optional. */
      }
  }, [draft, isNew]);
  const first = recommendFirstSkill(data, draft.focus);
  const weekly = draft.hoursPerDay * draft.daysPerWeek;
  async function finish(skipped = false) {
    setBusy(true);
    setError("");
    try {
      await onComplete(
        skipped
          ? {
              ...data.settings,
              focus: data.settings.onboarding?.focus || "all",
            }
          : draft,
        skipped,
      );
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* Completion is stored with the workspace. */
      }
    } catch {
      setError(
        "Your setup could not be saved. Your choices are still here. Please try again.",
      );
      setBusy(false);
    }
  }
  return (
    <main className="setup-page">
      <div className="setup-topbar">
        <div className="setup-brand">
          <img src="./icon.png" alt="" width={42} height={42} />
          <strong>Noryum</strong>
          <span>{t("A little direction. A meaningful next step.")}</span>
        </div>
        <button
          className="text-button"
          disabled={busy}
          onClick={() => (isNew ? void finish(true) : onCancel())}
        >
          {t(isNew ? "Set up later" : "Return to workspace")}
        </button>
      </div>
      <div className="setup-shell">
        <aside className="setup-story" aria-label={t("Your learning journey")}>
          <span className="eyebrow">{t("BUILT AROUND YOUR NEXT STEP")}</span>
          <h1>
            {t("Your potential.")}
            <br />
            <span>{t("A path to build it.")}</span>
          </h1>
          <p>
            {t(
              "Bring your goals, your curiosity and the time you have. We will help you find a practical place to start.",
            )}
          </p>
          <div className="setup-path">
            {[
              [
                BookOpen,
                "Learn with direction",
                "Choose a skill and understand what good looks like.",
              ],
              [
                Target,
                "Put it into practice",
                "Build projects that demonstrate what you can do.",
              ],
              [
                Check,
                "Make your progress visible",
                "Keep the evidence behind every step forward.",
              ],
            ].map(([Icon, label, description]) => {
              const StepIcon = Icon as typeof BookOpen;
              return (
                <div className="setup-path-item" key={String(label)}>
                  <span className="setup-path-icon">
                    <StepIcon size={19} />
                  </span>
                  <div>
                    <strong>{t(String(label))}</strong>
                    <p>{t(String(description))}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="setup-privacy">
            <ShieldCheck size={20} />
            <p>{t("No account needed. Your learning stays on this device.")}</p>
          </div>
        </aside>
        <section className="setup-content" aria-labelledby="setup-title">
          <ol className="setup-steps" aria-label={t("Setup progress")}>
            {steps.map((step, index) => (
              <li
                key={step}
                aria-current={index === draft.step ? "step" : undefined}
                className={index <= draft.step ? "reached" : ""}
              >
                <span>
                  {index < draft.step ? <Check size={14} /> : index + 1}
                </span>
                {t(step)}
              </li>
            ))}
          </ol>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (busy) return;
              if (draft.step < 2) setDraft({ ...draft, step: draft.step + 1 });
              else void finish();
            }}
          >
            <div className="setup-step-content">
              <p className="eyebrow">
                {t("QUICK SETUP")} · {draft.step + 1} / 3
              </p>
              <h2 id="setup-title" ref={title} tabIndex={-1}>
                {t(
                  [
                    "Welcome to your next chapter.",
                    "What would you like to focus on?",
                    "Make room for steady progress.",
                  ][draft.step],
                )}
              </h2>
              {draft.step === 0 && (
                <>
                  <p className="setup-lead">
                    {t(
                      "In three short steps, make Noryum feel like your workspace. You can change these choices at any time.",
                    )}
                  </p>
                  <label className="setup-label" htmlFor="setup-language">
                    {t("Interface language")}
                  </label>
                  <select
                    id="setup-language"
                    value={language}
                    onChange={(event) =>
                      setLanguage(event.target.value as "en" | "es-419")
                    }
                  >
                    <option value="en">English</option>
                    <option value="es-419">Español (Latinoamérica)</option>
                  </select>
                  <div className="setup-welcome-note">
                    <Compass size={26} />
                    <div>
                      <strong>{t("A roadmap, not a race.")}</strong>
                      <p>
                        {t(
                          "Connect skills, projects and evidence at a pace you can sustain. No experience assessment and no pressure to finish everything at once.",
                        )}
                      </p>
                    </div>
                  </div>
                  {!isNew && (
                    <p className="setup-safe">
                      {t(
                        "Your existing competencies, notes and project progress will stay intact.",
                      )}
                    </p>
                  )}
                </>
              )}
              {draft.step === 1 && (
                <>
                  <p className="setup-lead" id="focus-help">
                    {t(
                      "Choose a starting direction, not a permanent track. All areas remain available.",
                    )}
                  </p>
                  <fieldset
                    className="setup-choices"
                    aria-describedby="focus-help"
                  >
                    <legend className="sr-only">
                      {t("Starting direction")}
                    </legend>
                    {choices.map(([value, Icon, label, description]) => (
                      <label
                        className={`setup-choice ${draft.focus === value ? "chosen" : ""}`}
                        key={value}
                      >
                        <input
                          type="radio"
                          name="setup-focus"
                          value={value}
                          checked={draft.focus === value}
                          onChange={() => setDraft({ ...draft, focus: value })}
                        />
                        <Icon size={20} />
                        <span>
                          <strong>{t(label)}</strong>
                          <small>{t(description)}</small>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                </>
              )}
              {draft.step === 2 && (
                <>
                  <p className="setup-lead">
                    {t(
                      "Start with the time you can realistically protect. A consistent routine matters more than an ambitious estimate.",
                    )}
                  </p>
                  <div className="setup-pace">
                    <label htmlFor="setup-hours">
                      {t("Hours per day")}
                      <input
                        id="setup-hours"
                        type="number"
                        min="0.5"
                        max="16"
                        step="0.5"
                        required
                        value={
                          Number.isFinite(draft.hoursPerDay)
                            ? draft.hoursPerDay
                            : ""
                        }
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            hoursPerDay: event.target.valueAsNumber,
                          })
                        }
                      />
                    </label>
                    <label htmlFor="setup-days">
                      {t("Days per week")}
                      <input
                        id="setup-days"
                        type="number"
                        min="1"
                        max="7"
                        step="1"
                        required
                        value={
                          Number.isFinite(draft.daysPerWeek)
                            ? draft.daysPerWeek
                            : ""
                        }
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            daysPerWeek: event.target.valueAsNumber,
                          })
                        }
                      />
                    </label>
                  </div>
                  <div className="setup-weekly" aria-live="polite">
                    <Clock3 size={18} />
                    <strong>
                      {Number.isFinite(weekly) ? weekly : "—"}
                    </strong>{" "}
                    {t("hours / week")}
                  </div>
                  <article className="setup-recommendation">
                    <span className="eyebrow">
                      {t("YOUR FIRST PRACTICAL STEP")}
                    </span>
                    <h3>
                      {first
                        ? skillText(first, first.title, language)
                        : t("Explore your completed roadmap")}
                    </h3>
                    <p>
                      {first
                        ? skillText(first, first.objective, language)
                        : t(
                            "Keep strengthening the evidence in your portfolio.",
                          )}
                    </p>
                    <small>
                      {t(
                        "Your starting point considers prerequisites. Opening a competency does not change its learning status.",
                      )}
                    </small>
                  </article>
                  <p className="setup-safe">
                    {t(
                      "Your time preferences will be saved. Progress, notes and evidence will not be reset.",
                    )}
                  </p>
                </>
              )}
              {error && (
                <p className="setup-error" role="alert">
                  {t(error)}
                </p>
              )}
            </div>
            <footer className="setup-actions">
              <button
                type="button"
                disabled={busy || draft.step === 0}
                onClick={() => setDraft({ ...draft, step: draft.step - 1 })}
              >
                <ArrowLeft size={16} />
                {t("Back")}
              </button>
              <button type="submit" className="primary" disabled={busy}>
                {t(
                  busy
                    ? "Saving your workspace…"
                    : draft.step === 2
                      ? "Open my roadmap"
                      : "Continue",
                )}
                <ArrowRight size={16} />
              </button>
            </footer>
          </form>
          <p className="setup-footnote">
            {t("You can revisit this setup from Settings.")}
          </p>
        </section>
      </div>
    </main>
  );
}
