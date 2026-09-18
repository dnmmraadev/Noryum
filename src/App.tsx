import {
  useEffect,
  useRef,
  useState,
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
} from "react";
import {
  LayoutDashboard,
  Map,
  CalendarDays,
  BriefcaseBusiness,
  FolderKanban,
  PanelsTopLeft,
  BookOpen,
  Settings,
  Search,
  Sun,
  Moon,
  Plus,
  ArrowUpRight,
  Check,
  ChevronRight,
  X,
  Download,
  Upload,
  RotateCcw,
} from "lucide-react";
import {
  branches,
  statuses,
  colors,
  validate,
  type Data,
  type Skill,
  type Project,
} from "./model";
import { initialData, checkpoints } from "./data";
import {
  progress,
  remaining,
  readiness,
  plan,
  unlocked,
  mastered,
} from "./logic";
import { load, save, exportData } from "./persistence";
import Graph from "./Graph";
const nav = [
  ["Dashboard", LayoutDashboard],
  ["Roadmap", Map],
  ["Study plan", CalendarDays],
  ["Employability", BriefcaseBusiness],
  ["Projects", FolderKanban],
  ["Portfolio", PanelsTopLeft],
  ["Resources", BookOpen],
  ["Settings", Settings],
] as const;
function Meter({
  value,
  color = "#659af5",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="meter">
      <span style={{ width: `${value}%`, background: color }} />
    </div>
  );
}
function Field({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{title}</label>
      {isValidElement<{ id?: string }>(children)
        ? cloneElement(children, { id })
        : children}
    </div>
  );
}
export default function App() {
  const [data, setData] = useState<Data | null>(null),
    [view, setView] = useState("Roadmap"),
    [selected, setSelected] = useState<string | null>(null),
    [query, setQuery] = useState(""),
    [branch, setBranch] = useState(""),
    [status, setStatus] = useState(""),
    [checkpoint, setCheckpoint] = useState(""),
    [error, setError] = useState(""),
    [saved, setSaved] = useState("Loading local data…"),
    [confirm, setConfirm] = useState<{
      title: string;
      action: () => void;
    } | null>(null),
    [editor, setEditor] = useState<Skill | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const revision = useRef(0);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [view]);
  useEffect(() => {
    load()
      .then((d) => {
        setData(d || initialData());
        setSaved("Saved locally");
      })
      .catch((e) => {
        setError(
          "Local data could not be loaded. Your existing file has not been overwritten. " +
            String(e),
        );
        setSaved("Recovery needed");
      });
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        search.current?.focus();
      }
      if (e.key === "Escape") {
        setSelected(null);
        setEditor(null);
        setConfirm(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  function commit(next: Data, message?: string) {
    if (message)
      next = {
        ...next,
        activity: [
          { text: message, date: new Date().toISOString() },
          ...next.activity,
        ].slice(0, 100),
      };
    setData(next);
    setSaved("Saving…");
    const r = ++revision.current;
    void save(next)
      .then(() => {
        if (revision.current === r) setSaved("Saved locally");
      })
      .catch((e) => {
        setSaved("Save failed");
        setError(
          "Unable to save. Export a backup before closing. " + String(e),
        );
      });
  }
  function updateSkill(id: string, patch: Partial<Skill>) {
    if (data)
      commit(
        {
          ...data,
          skills: data.skills.map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        },
        patch.status
          ? `${data.skills.find((s) => s.id === id)?.title} → ${patch.status}`
          : undefined,
      );
  }
  function updateProject(id: string, patch: Partial<Project>) {
    if (data)
      commit(
        {
          ...data,
          projects: data.projects.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        },
        patch.status ? `Project updated → ${patch.status}` : undefined,
      );
  }
  async function importFile(f: File) {
    try {
      if (f.size > 5e6) throw Error("The file must be smaller than 5 MB.");
      const next = validate(JSON.parse(await f.text()));
      const missing = checkpoints
        .flatMap((c) => c.requirements)
        .filter((id) => !next.skills.some((s) => s.id === id));
      if (
        missing.length ||
        checkpoints
          .flatMap((c) => c.projects)
          .some((id) => !next.projects.some((p) => p.id === id))
      )
        throw Error("This backup is missing built-in checkpoint content.");
      setConfirm({
        title: `Replace your current roadmap with ${next.skills.length} competencies and ${next.projects.length} projects? Export a backup first if needed.`,
        action: () => {
          commit(next, "Backup imported");
          setSelected(null);
        },
      });
    } catch (e) {
      setError(
        "Import rejected. No data was changed. " +
          (e instanceof Error ? e.message : String(e)),
      );
    }
  }
  const importInput = (
    <input
      ref={file}
      hidden
      type="file"
      accept=".json,application/json"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) void importFile(f);
        e.target.value = "";
      }}
    />
  );
  if (!data)
    return (
      <div className="boot">
        <img src="./icon.png" width={64} height={64} alt="Noryum" />
        <h1>Noryum</h1>
        <p>{error || "Opening your workspace…"}</p>
        {error && (
          <button onClick={() => file.current?.click()}>
            Restore a backup
          </button>
        )}
        {importInput}
        {confirm && (
          <div className="modal">
            <p>{confirm.title}</p>
            <button
              onClick={() => {
                confirm.action();
                setConfirm(null);
                setError("");
              }}
            >
              Restore
            </button>
          </div>
        )}
      </div>
    );
  const skill = data.skills.find((s) => s.id === selected);
  const next = checkpoints.find((c) => readiness(c, data).percent < 100);
  const nextState = next ? readiness(next, data) : null;
  const study = plan(data.skills);
  const total = progress(data.skills);
  const weekly = data.settings.hoursPerDay * data.settings.daysPerWeek;
  const doneProjects = data.projects.filter(
    (p) => p.status === "Competent" && p.deliverables.every((d) => d.done),
  );
  function list(items: Skill[], limit = 1000) {
    return items.length ? (
      items.slice(0, limit).map((s) => (
        <button
          className="skill-row"
          key={s.id}
          onClick={() => setSelected(s.id)}
        >
          <span className={`status-dot s${statuses.indexOf(s.status)}`}>
            {mastered(s) ? "✓" : ""}
          </span>
          <span>
            <strong>{s.title}</strong>
            <small>
              {s.branch} · {s.hours} h
            </small>
          </span>
          <ChevronRight size={15} />
        </button>
      ))
    ) : (
      <p className="empty">Nothing here yet.</p>
    );
  }
  function branchProgress() {
    return branches.map((b, i) => (
      <div className="branch-progress" key={b}>
        <span>{b}</span>
        <Meter
          value={progress(data!.skills.filter((s) => s.branch === b))}
          color={colors[i]}
        />
        <small>{progress(data!.skills.filter((s) => s.branch === b))}%</small>
      </div>
    ));
  }
  return (
    <div className={`app ${data.settings.theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-symbol">
            <img src="./icon.png" width={42} height={42} alt="Noryum icon" />
          </div>
          <div>
            <b>Noryum</b>
            <small>
              INTELLIGENT BUSINESS
              <br />
              ENGINEERING
            </small>
          </div>
        </div>
        <div className="workspace-label">PERSONAL WORKSPACE</div>
        <nav>
          {nav.map(([name, Icon]) => (
            <button
              key={name}
              className={view === name ? "active" : ""}
              onClick={() => {
                setView(name);
                setSelected(null);
              }}
            >
              <Icon size={19} />
              {name}
              {view === name && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-progress">
          <div>
            <span>Your journey</span>
            <b>{total}%</b>
          </div>
          <Meter value={total} />
          <small>
            {data.skills.filter(mastered).length} of {data.skills.length}{" "}
            competencies mastered
          </small>
          <p>
            <Check size={14} />
            {doneProjects.length} / 5 projects complete
          </p>
        </div>
        <div className="local">
          <span />
          Offline workspace<small>{saved}</small>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} /> <b>{view}</b>
          </div>
          <div className="search">
            <Search size={17} />
            <input
              ref={search}
              aria-label="Search competencies"
              placeholder="Search competencies…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setView("Roadmap");
              }}
            />
            <kbd>Ctrl K</kbd>
          </div>
          <button
            className="icon-button"
            aria-label="Toggle theme"
            onClick={() =>
              commit({
                ...data,
                settings: {
                  ...data.settings,
                  theme: data.settings.theme === "dark" ? "light" : "dark",
                },
              })
            }
          >
            {data.settings.theme === "dark" ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}
          </button>
        </header>
        {error && (
          <div role="alert" className="alert">
            {error}
            <button aria-label="Dismiss error" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
        <div className="page-heading">
          <div>
            <div className="eyebrow">YOUR CAREER, BY DESIGN</div>
            <h1>{view === "Roadmap" ? "A clearer path forward." : view}</h1>
            <p>
              {view === "Roadmap"
                ? "Business Analysis + Data Analytics + Automation + Applied AI"
                : "Build capability. Create evidence. Move forward with confidence."}
            </p>
          </div>
          <div className="heading-actions">
            <span className="pace">
              <CalendarDays size={15} />
              {weekly} h / week
            </span>
            <button
              className="primary"
              onClick={() =>
                setEditor({
                  id: "custom-" + crypto.randomUUID(),
                  title: "",
                  branch: "Foundations",
                  status: "Not started",
                  priority: "Medium",
                  hours: 8,
                  prerequisites: [],
                  objective: "",
                  criteria: [],
                  evidence: "",
                  notes: "",
                  resources: [],
                  custom: true,
                })
              }
            >
              <Plus size={16} />
              Add competency
            </button>
          </div>
        </div>
        <div
          className={`workspace ${skill || view === "Roadmap" ? "has-detail" : ""}`}
        >
          <section className="content">
            {view === "Roadmap" && (
              <>
                <div className="roadmap-toolbar">
                  <div className="track-label">
                    <span className="live-dot" />
                    Career map <small>{data.skills.length} competencies</small>
                  </div>
                  <select
                    aria-label="Branch filter"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  >
                    <option value="">All branches</option>
                    {branches.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Status filter"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">All states</option>
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Checkpoint path"
                    value={checkpoint}
                    onChange={(e) => setCheckpoint(e.target.value)}
                  >
                    <option value="">Full roadmap</option>
                    {checkpoints.map((c, i) => (
                      <option value={c.id} key={c.id}>
                        Path to checkpoint {i + 1}
                      </option>
                    ))}
                  </select>
                  {(query || branch || status || checkpoint) && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setBranch("");
                        setStatus("");
                        setCheckpoint("");
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <Graph
                  data={data}
                  query={query}
                  branch={branch}
                  status={status}
                  checkpoint={checkpoint}
                  onSkill={setSelected}
                  onCheckpoint={() => setView("Employability")}
                />
                <div className="legend">
                  {statuses.map((s, i) => (
                    <span key={s}>
                      <i className={`status-dot s${i}`} />
                      {s}
                    </span>
                  ))}
                  <span>◇ Project evidence</span>
                </div>
                <div className="bottom-grid">
                  <article className="card">
                    <h3>Progress by branch</h3>
                    {branchProgress()}
                  </article>
                  <article className="card next-card">
                    <div className="eyebrow">NEXT CAREER CHECKPOINT</div>
                    <h2>{next?.title || "All checkpoints complete"}</h2>
                    <p>Turn your learning into professional evidence.</p>
                    <Meter value={nextState?.percent ?? 100} color="#46c798" />
                    <div className="spread">
                      <small>
                        {nextState?.missing.length || 0} competencies remaining
                      </small>
                      <b>{nextState?.percent ?? 100}%</b>
                    </div>
                    <button onClick={() => setView("Employability")}>
                      Explore checkpoint <ArrowUpRight size={15} />
                    </button>
                  </article>
                  <article className="card">
                    <div className="spread">
                      <h3>Ready to learn</h3>
                      <button
                        className="text-button"
                        onClick={() => setView("Study plan")}
                      >
                        View plan →
                      </button>
                    </div>
                    {list(study.Now, 3)}
                  </article>
                </div>
              </>
            )}
            {view === "Dashboard" && (
              <>
                <div className="stats-grid">
                  {[
                    [`${total}%`, "Overall mastery"],
                    [
                      `${data.skills.filter(mastered).reduce((n, s) => n + s.hours, 0)} h`,
                      "Mastered workload (estimated)",
                    ],
                    [`${remaining(data.skills)} h`, "Remaining study estimate"],
                    [`${doneProjects.length} / 5`, "Completed projects"],
                  ].map(([v, l]) => (
                    <article className="card stat" key={l}>
                      <small>{l}</small>
                      <strong>{v}</strong>
                    </article>
                  ))}
                </div>
                <div className="two-grid">
                  <article className="card">
                    <h3>Progress by branch</h3>
                    {branchProgress()}
                    <p className="muted">
                      Skipped competencies do not count as mastery.
                    </p>
                  </article>
                  <article className="card">
                    <h3>Career readiness</h3>
                    <p>
                      Current:{" "}
                      {checkpoints
                        .filter((c) => readiness(c, data).percent === 100)
                        .at(-1)?.title || "Building foundations"}
                    </p>
                    <h2>{next?.title || "All checkpoints complete"}</h2>
                    <p>
                      {nextState?.weeks || 0} weeks of competency work at your
                      current pace, plus project delivery.
                    </p>
                    <Meter value={nextState?.percent ?? 100} />
                    <button onClick={() => setView("Employability")}>
                      Review readiness <ArrowUpRight size={16} />
                    </button>
                  </article>
                  <article className="card">
                    <h3>Competency states</h3>
                    {statuses.map((s) => (
                      <div className="spread row" key={s}>
                        <span>{s}</span>
                        <b>
                          {data.skills.filter((x) => x.status === s).length}
                        </b>
                      </div>
                    ))}
                  </article>
                  <article className="card">
                    <h3>Recent activity</h3>
                    {data.activity.length ? (
                      data.activity.slice(0, 8).map((a, i) => (
                        <div className="activity" key={i}>
                          <Check size={16} />
                          <span>
                            {a.text}
                            <small>
                              {new Date(a.date).toLocaleString("en-US")}
                            </small>
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="empty">
                        Your first step starts here. Update a competency to
                        begin.
                      </p>
                    )}
                  </article>
                </div>
                <article className="card">
                  <h3>Needed for your next checkpoint</h3>
                  <div className="three-grid">
                    {list(nextState?.missing || [])}
                  </div>
                </article>
              </>
            )}
            {view === "Study plan" && (
              <>
                <div className="notice">
                  Suggestions use prerequisite readiness and priority. English
                  can advance independently. Skipped prerequisites allow
                  exploration; they do not establish mastery.
                </div>
                <div className="three-grid plan">
                  {Object.entries(study).map(([label, items], i) => (
                    <article className="card" key={label}>
                      <div className="eyebrow">0{i + 1} / STUDY QUEUE</div>
                      <h2>
                        {label} <small>{items.length}</small>
                      </h2>
                      <p>
                        {
                          [
                            "Prerequisites resolved. Start or continue here.",
                            "One learning layer away.",
                            "Build toward these longer-term capabilities.",
                          ][i]
                        }
                      </p>
                      {list(items)}
                    </article>
                  ))}
                </div>
              </>
            )}
            {view === "Employability" && (
              <>
                <div className="notice">
                  Readiness measures evidence against this roadmap, not a
                  guarantee of employment. Initial timelines assume 45 study
                  hours per week and are estimates.
                </div>
                {checkpoints.map((c, i) => {
                  const r = readiness(c, data);
                  return (
                    <article className="card checkpoint-card" key={c.id}>
                      <div className="checkpoint-number">0{i + 1}</div>
                      <div className="checkpoint-body">
                        <div className="spread">
                          <h2>{c.title}</h2>
                          <span
                            className={`badge ${r.percent === 100 ? "green" : ""}`}
                          >
                            {r.percent === 100
                              ? "Ready"
                              : r.percent >= 75
                                ? "Close"
                                : "Not ready"}{" "}
                            · {r.percent}%
                          </span>
                        </div>
                        <p>{c.roles.join(" · ")}</p>
                        <Meter value={r.percent} color={colors[i + 1]} />
                        <div className="checkpoint-metrics">
                          <span>
                            Initial cumulative estimate: <b>{c.weeks} weeks</b>
                          </span>
                          <span>
                            Remaining competency work: <b>~{r.weeks} weeks</b>
                          </span>
                          <span>
                            <b>
                              {r.skills.length - r.missing.length}/
                              {r.skills.length}
                            </b>{" "}
                            mastered
                          </span>
                        </div>
                        <p className="muted">
                          Remaining time excludes additional project delivery
                          and interviews. Adjust your pace in Settings.
                        </p>
                        <div className="chips">
                          {c.projects.map((id) => {
                            const p = data.projects.find((p) => p.id === id)!;
                            return (
                              <button
                                key={id}
                                onClick={() => setView("Projects")}
                              >
                                {doneProjects.includes(p) ? "✓" : "◇"} {p.title}
                              </button>
                            );
                          })}
                        </div>
                        <details>
                          <summary>
                            Review {r.missing.length} missing competencies
                          </summary>
                          <div className="three-grid">{list(r.missing)}</div>
                        </details>
                        <button
                          className="text-button"
                          onClick={() => {
                            setCheckpoint(c.id);
                            setQuery("");
                            setBranch("");
                            setStatus("");
                            setView("Roadmap");
                          }}
                        >
                          Show this path on the map →
                        </button>
                      </div>
                    </article>
                  );
                })}
              </>
            )}
            {view === "Projects" && (
              <div className="project-grid">
                {data.projects.map((p, i) => (
                  <article className="card project-card" key={p.id}>
                    <div className="eyebrow">
                      PROJECT 0{i + 1} / PRACTICAL EVIDENCE
                    </div>
                    <h2>{p.title}</h2>
                    <Field title="Project status">
                      <select
                        value={p.status}
                        onChange={(e) =>
                          updateProject(p.id, {
                            status: e.target.value as Project["status"],
                          })
                        }
                      >
                        {statuses.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <h4>Deliverables</h4>
                    {p.deliverables.map((d, j) => (
                      <label className="check-row" key={d.title}>
                        <input
                          type="checkbox"
                          checked={d.done}
                          onChange={(e) =>
                            updateProject(p.id, {
                              deliverables: p.deliverables.map((x, k) =>
                                k === j ? { ...x, done: e.target.checked } : x,
                              ),
                            })
                          }
                        />
                        {d.title}
                      </label>
                    ))}
                    {p.status === "Competent" &&
                      !p.deliverables.every((d) => d.done) && (
                        <p className="warning">
                          Complete every deliverable to count this project
                          toward a checkpoint.
                        </p>
                      )}
                    <div className="two-grid">
                      <Field title="Start date">
                        <input
                          type="date"
                          value={p.start}
                          max={p.end || undefined}
                          onChange={(e) =>
                            updateProject(p.id, { start: e.target.value })
                          }
                        />
                      </Field>
                      <Field title="Completion date">
                        <input
                          type="date"
                          value={p.end}
                          min={p.start || undefined}
                          onChange={(e) =>
                            updateProject(p.id, { end: e.target.value })
                          }
                        />
                      </Field>
                    </div>
                    <Field title="GitHub URL">
                      <input
                        placeholder="https://github.com/…"
                        value={p.github}
                        onChange={(e) =>
                          updateProject(p.id, { github: e.target.value })
                        }
                      />
                    </Field>
                    <Field title="Evidence links (one per line)">
                      <textarea
                        value={p.links}
                        placeholder="Documents, dashboards, automation demos, case studies…"
                        onChange={(e) =>
                          updateProject(p.id, { links: e.target.value })
                        }
                      />
                    </Field>
                    <Field title="Project notes">
                      <textarea
                        value={p.notes}
                        onChange={(e) =>
                          updateProject(p.id, { notes: e.target.value })
                        }
                      />
                    </Field>
                    <button onClick={() => setSelected(p.requirements[0])}>
                      View linked competency <ChevronRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
            )}
            {view === "Portfolio" && (
              <>
                <div className="notice">
                  Your local evidence library: BA documents, dashboards,
                  repositories, automations and case studies. Add evidence links
                  and notes in Projects.
                </div>
                <div className="project-grid">
                  {data.projects.map((p, i) => (
                    <article className="card" key={p.id}>
                      <div className="eyebrow">
                        EVIDENCE COLLECTION 0{i + 1}
                      </div>
                      <h2>{p.title}</h2>
                      <span className="badge">{p.status}</span>
                      <p>
                        {p.deliverables.filter((d) => d.done).length} /{" "}
                        {p.deliverables.length} deliverables recorded
                      </p>
                      {p.deliverables
                        .filter((d) => d.done)
                        .map((d) => (
                          <p key={d.title}>✓ {d.title}</p>
                        ))}
                      {[p.github, ...p.links.split("\n")]
                        .filter((x) => /^https?:\/\//.test(x))
                        .map((url, j) => (
                          <a
                            className="resource"
                            key={j}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {url}
                            <ArrowUpRight size={16} />
                          </a>
                        ))}
                      <p className="notes">
                        {p.notes || "No evidence notes yet."}
                      </p>
                      <button onClick={() => setView("Projects")}>
                        Manage evidence
                      </button>
                    </article>
                  ))}
                </div>
              </>
            )}
            {view === "Resources" && (
              <>
                <div className="notice">
                  Free reference material, optional to open. Every competency
                  can be studied and tracked offline. Vendor tools may have
                  separate licensing; local and mock implementations are valid
                  evidence.
                </div>
                <div className="three-grid">
                  {branches.map((b, i) => (
                    <article className="card" key={b}>
                      <h3 style={{ color: colors[i] }}>{b}</h3>
                      {data.skills
                        .filter((s) => s.branch === b)
                        .map((s) => (
                          <div className="resource-group" key={s.id}>
                            <button
                              className="text-button"
                              onClick={() => setSelected(s.id)}
                            >
                              {s.title}
                            </button>
                            {s.resources.map((r, j) => (
                              <a
                                key={j}
                                href={r.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {r.title} ↗
                              </a>
                            ))}
                          </div>
                        ))}
                    </article>
                  ))}
                </div>
              </>
            )}
            {view === "Settings" && (
              <div className="settings-grid">
                <article className="card">
                  <h2>Your study rhythm</h2>
                  <p>
                    Estimates adapt to your available time. Progress is based on
                    mastery.
                  </p>
                  <Field title="Hours per day">
                    <input
                      type="number"
                      min="0.5"
                      max="16"
                      step="0.5"
                      value={data.settings.hoursPerDay}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (n >= 0.5 && n <= 16)
                          commit({
                            ...data,
                            settings: { ...data.settings, hoursPerDay: n },
                          });
                      }}
                    />
                  </Field>
                  <Field title="Days per week">
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={data.settings.daysPerWeek}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isInteger(n) && n >= 1 && n <= 7)
                          commit({
                            ...data,
                            settings: { ...data.settings, daysPerWeek: n },
                          });
                      }}
                    />
                  </Field>
                  <h2>{weekly} hours / week</h2>
                  <p>
                    ~{Math.ceil(remaining(data.skills) / weekly)} weeks of
                    remaining competency work.
                  </p>
                  <Field title="Appearance">
                    <select
                      value={data.settings.theme}
                      onChange={(e) =>
                        commit({
                          ...data,
                          settings: {
                            ...data.settings,
                            theme: e.target.value as "dark" | "light",
                          },
                        })
                      }
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </Field>
                </article>
                <article className="card">
                  <h2>Your data stays yours</h2>
                  <p>
                    Everything is stored on this device. Export a readable JSON
                    backup to move your complete workspace between computers.
                  </p>
                  <div className="button-stack">
                    <button onClick={() => exportData(data)}>
                      <Download size={17} />
                      Export complete backup
                    </button>
                    <button onClick={() => file.current?.click()}>
                      <Upload size={17} />
                      Import backup
                    </button>
                    <button
                      className="danger"
                      onClick={() =>
                        setConfirm({
                          title:
                            "Reset all competency states, project states, deliverable checks and project dates? Notes, resources, custom competencies and settings will be kept.",
                          action: () =>
                            commit(
                              {
                                ...data,
                                skills: data.skills.map((s) => ({
                                  ...s,
                                  status: "Not started",
                                })),
                                projects: data.projects.map((p) => ({
                                  ...p,
                                  status: "Not started",
                                  start: "",
                                  end: "",
                                  deliverables: p.deliverables.map((d) => ({
                                    ...d,
                                    done: false,
                                  })),
                                })),
                                activity: [],
                              },
                              "Progress reset",
                            ),
                        })
                      }
                    >
                      <RotateCcw size={17} />
                      Reset progress
                    </button>
                  </div>
                  <p className="muted">
                    No account. No cloud dependency. No telemetry.
                  </p>
                </article>
              </div>
            )}
          </section>
          {!skill && view === "Roadmap" && (
            <aside className="detail" aria-label="Competency details">
              <span className="eyebrow">COMPETENCY DETAILS</span>
              <h2>Your next step starts here</h2>
              <p>
                Select a competency to explore its learning objective,
                prerequisites, mastery criteria and practical evidence.
              </p>
              <h4>Your roadmap at a glance</h4>
              <p>
                {data.skills.filter(mastered).length} of {data.skills.length}{" "}
                competencies mastered · {total}% complete
              </p>
              <Meter value={total} />
              <p>
                {doneProjects.length} of {data.projects.length} projects
                completed with all deliverables.
              </p>
              <h4>{next ? "Next checkpoint" : "Checkpoints completed"}</h4>
              <p>
                {next
                  ? next.title
                  : "You have met every checkpoint. Keep strengthening your portfolio evidence."}
              </p>
              <h4>Ready to explore</h4>
              {study.Now.length ? (
                list(study.Now, 3)
              ) : (
                <p>
                  No ready competencies remain. Review your study plan or
                  explore any competency on the map.
                </p>
              )}
              <h4>Make room for your journey</h4>
              <p>
                Drag the bar below the map to adjust its height. Pan across the
                map, scroll to zoom, or use filters to focus on a branch.
              </p>
            </aside>
          )}
          {skill && (
            <aside className="detail" key={skill.id}>
              <div className="spread">
                <span className="eyebrow">COMPETENCY DETAILS</span>
                <button
                  className="icon-button"
                  aria-label="Clear competency selection"
                  onClick={() => setSelected(null)}
                >
                  <X size={18} />
                </button>
              </div>
              <h2>{skill.title}</h2>
              <div className="chips">
                <span
                  className="badge"
                  style={{ color: colors[branches.indexOf(skill.branch)] }}
                >
                  {skill.branch}
                </span>
                <span className="badge">{skill.priority} priority</span>
              </div>
              {!unlocked(skill, data.skills) && (
                <p className="warning">
                  Prerequisites are pending. You can still explore and record
                  progress.
                </p>
              )}
              <Field title="Learning status">
                <select
                  aria-label="Learning status"
                  value={skill.status}
                  onChange={(e) =>
                    updateSkill(skill.id, {
                      status: e.target.value as Skill["status"],
                    })
                  }
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <div className="two-grid">
                <Field title="Estimated hours">
                  <input
                    type="number"
                    min="0.5"
                    max="1000"
                    step="0.5"
                    value={skill.hours}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (n >= 0.5 && n <= 1000)
                        updateSkill(skill.id, { hours: n });
                    }}
                  />
                </Field>
                <Field title="Priority">
                  <select
                    value={skill.priority}
                    onChange={(e) =>
                      updateSkill(skill.id, {
                        priority: e.target.value as Skill["priority"],
                      })
                    }
                  >
                    {["High", "Medium", "Low"].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <h4>Learning objective</h4>
              <p>{skill.objective}</p>
              <h4>Prerequisites</h4>
              {skill.prerequisites.length ? (
                skill.prerequisites.map((id) => (
                  <button
                    className="dependency"
                    key={id}
                    onClick={() => setSelected(id)}
                  >
                    {data.skills.find((s) => s.id === id)?.status ===
                    "Competent"
                      ? "✓"
                      : "○"}{" "}
                    {data.skills.find((s) => s.id === id)?.title}
                  </button>
                ))
              ) : (
                <p className="muted">Independent starting point</p>
              )}
              <h4>Unlocks</h4>
              {data.skills
                .filter((s) => s.prerequisites.includes(skill.id))
                .map((s) => (
                  <button
                    className="dependency"
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                  >
                    {s.title} →
                  </button>
                ))}
              <h4>Mastery criteria</h4>
              <ul>
                {skill.criteria.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <h4>Practical evidence</h4>
              <p>{skill.evidence}</p>
              {skill.projectId && (
                <button
                  onClick={() => {
                    setView("Projects");
                    setSelected(null);
                  }}
                >
                  Open related project <ChevronRight size={16} />
                </button>
              )}
              <h4>Free resources</h4>
              {skill.resources.map((r, i) => (
                <div className="resource" key={i}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.title} ↗
                  </a>
                  <button
                    aria-label={`Remove ${r.title}`}
                    onClick={() =>
                      setConfirm({
                        title: "Remove this resource?",
                        action: () =>
                          updateSkill(skill.id, {
                            resources: skill.resources.filter(
                              (_, j) => j !== i,
                            ),
                          }),
                      })
                    }
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <ResourceForm
                onAdd={(title, url) =>
                  updateSkill(skill.id, {
                    resources: [...skill.resources, { title, url }],
                  })
                }
              />
              <Field title="Personal notes">
                <textarea
                  rows={5}
                  placeholder="Capture what you learned, evidence and questions…"
                  value={skill.notes}
                  onChange={(e) =>
                    updateSkill(skill.id, { notes: e.target.value })
                  }
                />
              </Field>
              <button onClick={() => setEditor(structuredClone(skill))}>
                Edit competency & resources
              </button>
              {skill.custom && (
                <button
                  className="danger"
                  onClick={() =>
                    setConfirm({
                      title:
                        "Delete this custom competency and remove its dependency links?",
                      action: () => {
                        commit({
                          ...data,
                          skills: data.skills
                            .filter((s) => s.id !== skill.id)
                            .map((s) => ({
                              ...s,
                              prerequisites: s.prerequisites.filter(
                                (id) => id !== skill.id,
                              ),
                            })),
                          projects: data.projects.map((p) => ({
                            ...p,
                            requirements: p.requirements.filter(
                              (id) => id !== skill.id,
                            ),
                          })),
                        });
                        setSelected(null);
                      },
                    })
                  }
                >
                  Delete custom competency
                </button>
              )}
            </aside>
          )}
        </div>
      </main>
      {importInput}
      {confirm && (
        <div className="overlay">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm change"
          >
            <h2>Confirm change</h2>
            <p>{confirm.title}</p>
            <div className="modal-actions">
              <button onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className="primary"
                onClick={() => {
                  confirm.action();
                  setConfirm(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {editor && (
        <div className="overlay">
          <form
            className="modal editor"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                const next = {
                  ...data,
                  skills: data.skills.some((s) => s.id === editor.id)
                    ? data.skills.map((s) => (s.id === editor.id ? editor : s))
                    : [...data.skills, editor],
                };
                validate(next);
                commit(next);
                setEditor(null);
                setSelected(editor.id);
              } catch (e) {
                setError(String(e));
              }
            }}
          >
            <div className="spread">
              <h2>
                {data.skills.some((s) => s.id === editor.id)
                  ? "Edit competency"
                  : "Add competency"}
              </h2>
              <button
                type="button"
                aria-label="Close editor"
                onClick={() => setEditor(null)}
              >
                <X size={17} />
              </button>
            </div>
            <Field title="Title">
              <input
                required
                maxLength={200}
                value={editor.title}
                onChange={(e) =>
                  setEditor({ ...editor, title: e.target.value })
                }
              />
            </Field>
            <Field title="Branch">
              <select
                value={editor.branch}
                onChange={(e) =>
                  setEditor({
                    ...editor,
                    branch: e.target.value as Skill["branch"],
                  })
                }
              >
                {branches.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field title="Learning objective">
              <textarea
                required
                value={editor.objective}
                onChange={(e) =>
                  setEditor({ ...editor, objective: e.target.value })
                }
              />
            </Field>
            <Field title="Mastery criteria (one per line)">
              <textarea
                required
                value={editor.criteria.join("\n")}
                onChange={(e) =>
                  setEditor({ ...editor, criteria: e.target.value.split("\n") })
                }
              />
            </Field>
            <Field title="Practical evidence">
              <textarea
                required
                value={editor.evidence}
                onChange={(e) =>
                  setEditor({ ...editor, evidence: e.target.value })
                }
              />
            </Field>
            <Field title="Prerequisites (Ctrl-click to select multiple)">
              <select
                multiple
                value={editor.prerequisites}
                onChange={(e) =>
                  setEditor({
                    ...editor,
                    prerequisites: Array.from(
                      e.target.selectedOptions,
                      (o) => o.value,
                    ),
                  })
                }
              >
                {data.skills
                  .filter((s) => s.id !== editor.id)
                  .map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.title}
                    </option>
                  ))}
              </select>
            </Field>
            <h4>Resources</h4>
            {editor.resources.map((r, i) => (
              <div className="two-grid" key={i}>
                <Field title="Resource title">
                  <input
                    required
                    value={r.title}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        resources: editor.resources.map((x, j) =>
                          j === i ? { ...x, title: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </Field>
                <Field title="Resource URL">
                  <input
                    required
                    type="url"
                    value={r.url}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        resources: editor.resources.map((x, j) =>
                          j === i ? { ...x, url: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </Field>
              </div>
            ))}
            <button className="primary" type="submit">
              Save competency
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
function ResourceForm({
  onAdd,
}: {
  onAdd: (title: string, url: string) => void;
}) {
  const [title, setTitle] = useState(""),
    [url, setUrl] = useState("");
  return (
    <form
      className="resource-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^https?:\/\//.test(url)) return;
        onAdd(title, url);
        setTitle("");
        setUrl("");
      }}
    >
      <input
        required
        aria-label="Resource title"
        placeholder="Resource title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        required
        type="url"
        pattern="https?://.*"
        aria-label="Resource URL"
        placeholder="https://…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button type="submit">
        <Plus size={14} />
        Add resource
      </button>
    </form>
  );
}
