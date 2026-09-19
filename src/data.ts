import { branches, type Data, type Skill, type Checkpoint } from "./model";
// Each row is id | title | prerequisites | practical evidence. Branches are parallel tracks.
const content = [
  `business|Business Fundamentals||Map a business model, customers, costs and revenue
thinking|Analytical Thinking||Break an ambiguous business problem into testable questions
excel|Excel / Google Sheets|thinking|Build a reconciled spreadsheet with lookups, pivots and validation
kpi|Business KPIs & Metrics|business,excel|Define five KPIs with formulas, owners and decision thresholds
git|Git & GitHub||Create a repository with branches, commits and a reviewed pull request`,
  `ba|Business Analysis Fundamentals|business|Write a business analysis approach and scope statement
stakeholder|Stakeholder Analysis|ba|Produce a stakeholder map and engagement plan
requirements|Requirements Gathering|ba,stakeholder|Conduct two mock interviews and build a traceable requirements register
functional|Functional & Nonfunctional Requirements|requirements|Separate behaviors from measurable quality constraints
asis|AS-IS Processes|ba|Map an existing process with handoffs and bottlenecks
tobe|TO-BE Processes|asis,root|Design a future process with measurable improvements
bpmn|BPMN|asis|Model gateways, events, pools and exception flows
root|Root Cause Analysis|thinking,asis|Use five whys and evidence to distinguish causes from symptoms
stories|User Stories|requirements|Write a prioritized backlog with personas and outcomes
acceptance|Acceptance Criteria|requirements,stories|Write testable Given-When-Then criteria including edge cases
agile|Agile / Scrum|ba|Plan a sprint and explain the purpose of each ceremony
uat|User Acceptance Testing|acceptance,functional|Run a UAT plan and record defects and sign-off evidence
cases|Business Cases|kpi,requirements|Compare solution alternatives, assumptions, costs and benefits
roi|ROI Measurement|cases|Calculate ROI and sensitivity under three scenarios`,
  `sql|SQL Fundamentals|thinking|Query a sample dataset using filters, joins and grouping
sql2|Intermediate SQL|sql|Answer business questions with CTEs, subqueries and window functions
sql3|Advanced SQL for Analytics|sql2|Build cohort and retention analyses and inspect query plans
clean|Data Cleaning|excel|Create a reproducible pipeline for missing and duplicate records
quality|Data Quality|clean|Implement validity, uniqueness and completeness checks
model|Data Modeling|sql,quality|Build a star schema with documented grain and relationships
stats|Descriptive Statistics|thinking|Explain distributions, spread and outliers in a business dataset
probability|Applied Probability & Statistics|stats|Evaluate uncertainty and a hypothesis with stated limitations
query|Power Query|clean|Combine files and document transformation steps
powerbi|Power BI Fundamentals|query,model|Build an interactive report with a correct semantic model
dax|DAX|powerbi|Create measures using filter context and time intelligence
viz|Data Visualization|stats,kpi|Select appropriate charts and remove misleading encodings
storytelling|Data Storytelling|viz,powerbi|Present findings, caveats and a recommended business action
bi|Business Intelligence|dax,storytelling|Deliver a decision-focused dashboard with refresh and ownership notes`,
  `python|Python Fundamentals|thinking|Write tested functions using collections and file operations
pythondata|Python for Data Analytics|python,stats|Analyze and summarize a business dataset reproducibly
pandas|Pandas|pythondata,clean|Join, reshape and aggregate tables with validation
http|HTTP Fundamentals||Inspect methods, status codes, headers and request lifecycle
rest|REST APIs|http,json|Call a paginated API and interpret its contract
json|JSON||Read, validate and transform nested JSON documents
auth|Authentication|rest|Explain tokens, scopes and secret handling without committing credentials
webhooks|Webhooks|rest|Design a verified webhook with deduplication
requests|Python Requests|python,rest|Implement timeouts, pagination and error handling in a client
integration|API Integration|requests,auth|Connect two local mock services with a documented data mapping`,
  `discovery|Process Discovery|asis|Observe a workflow and quantify repetitive work
opportunity|Automation Opportunity Analysis|discovery,roi|Score automation candidates by value, risk and feasibility
automate|Power Automate|discovery|Build and document an approval workflow using available local or free alternatives
apps|Power Apps Fundamentals|automate|Design a validated business form and its data model
n8n|n8n|rest,discovery|Run a local workflow that transforms data between services
workflow|Workflow Design|opportunity|Design triggers, decisions, handoffs and recovery paths
errors|Error Handling|workflow|Handle validation, timeout and partial-failure scenarios
logging|Logging|errors|Produce structured logs without exposing secrets
retries|Retries & Fallbacks|errors|Implement bounded retries, backoff and a safe fallback
autotest|Automation Testing|logging,retries|Test happy paths, duplicate events and failure recovery
businessauto|Business Process Automation|autotest,n8n|Deliver an observable end-to-end process automation`,
  `llm|LLM Fundamentals||Explain tokens, context, hallucinations and model limitations
prompt|Prompt Engineering|llm|Compare prompts against a fixed set of representative examples
structured|Structured Outputs|llm,json|Validate model output against a schema with failure handling
llmapi|LLM APIs|llm,rest|Build an adapter using a local model or mock API
tools|Tool / Function Calling|llm,structured,llmapi|Validate tool arguments and limit execution permissions
aiauto|AI Automation|llmapi,workflow,structured|Integrate model output into a workflow with human review
rag|RAG Fundamentals|llmapi,pandas|Build retrieval with citations and evaluate grounded answers
agents|AI Agents Fundamentals|tools|Create a bounded agent with explicit stopping rules
hitl|Human-in-the-Loop|aiauto|Route uncertain or high-impact outputs for human approval
eval|AI Evaluation|prompt,structured|Build a held-out evaluation set and report quality and failure rates
guardrails|Guardrails|hitl,tools|Validate inputs and outputs and test prompt injection boundaries
aitest|AI System Testing|eval,guardrails|Run regression, safety and integration tests with local fixtures
aiprocess|AI Process Discovery|opportunity,llm|Identify a useful AI intervention and a non-AI baseline
aisolution|AI Solution Design|eval,aitest,aiprocess|Design an evaluated solution with cost, privacy and fallback constraints
aiba|AI Business Analysis|aisolution,requirements|Translate an AI opportunity into measurable, testable requirements`,
  `english|Professional English for Technology||Record a clear explanation of a technical project
english1|English A1–A2||Introduce yourself and describe daily work tasks
english2|English B1|english1|Lead a short project update and ask clarifying questions
english3|English B2|english2|Present a case study and defend tradeoffs in English
projectba|Business Analysis Project|uat,bpmn,stories|Complete the Business Process Analysis deliverables
projectdata|BA + Data Analytics Project|projectba,sql2,powerbi,viz|Deliver a dashboard linked to business requirements
projectauto|Data + Automation Project|projectdata,businessauto,integration|Automate an analytics pipeline with recovery evidence
projectai|AI Automation Project|projectauto,aiauto,aitest|Demonstrate an evaluated AI workflow with human escalation
projectfinal|BA + Data + Automation + AI Project|projectai,aiba,bi|Deliver an integrated solution with quantified business outcomes
casestudy|Case Study Documentation|projectba|Write a problem, approach, evidence and outcome narrative
portfolio|Professional Portfolio|casestudy,git|Organize accessible evidence with context and clear ownership
cv|BA + Data + AI Resume|portfolio|Write evidence-backed accomplishment bullets for a target role
linkedin|Professional LinkedIn|cv|Draft a headline, summary and featured project descriptions
interviewba|Business Analysis Interviews|projectba,english|Practice a requirements and stakeholder case interview
interviewdata|Data Analytics Interviews|projectdata|Explain SQL, metrics and dashboard decisions in a mock interview
interviewauto|Automation / AI Interviews|projectai|Discuss failure modes, evaluation and operational tradeoffs
applyba|Business Analyst Applications|cv,interviewba|Maintain a tailored application tracker and feedback notes
applydata|Data / BI Analyst Applications|cv,interviewdata|Match project evidence to data role requirements
applyauto|Automation Analyst Applications|cv,projectauto|Prepare an automation-focused application and demo
applyai|AI Automation Analyst Applications|cv,interviewauto|Prepare an evaluated AI automation case study for applications
applyaiba|AI Business Analyst Applications|cv,aiba,projectfinal|Connect business outcomes to AI solution design in an application
industry|Industry Specialization|cases|Document one industry workflow, terminology and constraints
market|Quarterly Market Review||Review a sample of roles and update a skills-gap assessment`,
];
const sources = [
  ["OpenStax Business", "https://openstax.org/subjects/business"],
  [
    "IIBA Business Analysis Standard",
    "https://www.iiba.org/business-analysis-standards/",
  ],
  ["Microsoft Learn", "https://learn.microsoft.com/en-us/training/"],
  ["Python Tutorial", "https://docs.python.org/3/tutorial/"],
  ["n8n Documentation", "https://docs.n8n.io/"],
  ["Hugging Face Course", "https://huggingface.co/learn/llm-course/chapter1/1"],
  ["British Council LearnEnglish", "https://learnenglish.britishcouncil.org/"],
];
const skills: Skill[] = content.flatMap((block, b) =>
  block.split("\n").map((row, i) => {
    const [id, title, deps, evidence] = row.split("|");
    return {
      id,
      title,
      branch: branches[b],
      status: "Not started",
      priority: i < 4 ? "High" : "Medium",
      hours: id.startsWith("project") ? 35 : 8 + (i % 4) * 4,
      prerequisites: deps ? deps.split(",") : [],
      objective: evidence + ".",
      criteria: [
        evidence + ".",
        "Explain the approach, assumptions and limitations without a tutorial.",
        "Validate the result against acceptance criteria and record the evidence.",
      ],
      evidence,
      notes: "",
      resources: [{ title: sources[b][0], url: sources[b][1] }],
      custom: false,
    } as Skill;
  }),
);
const definitions = [
  [
    "p1",
    "Business Process Analysis",
    "projectba",
    "Process map (AS-IS and TO-BE)|Stakeholder and requirements register|User stories and UAT evidence|Business case and retrospective",
  ],
  [
    "p2",
    "BA + Data Analytics",
    "projectdata",
    "Business questions and KPI definitions|Clean dataset and SQL analysis|Power BI dashboard|Decision brief and limitations",
  ],
  [
    "p3",
    "Data + Automation",
    "projectauto",
    "Workflow and API contract|Working automated data pipeline|Failure recovery tests and logs|Operating guide and time-savings estimate",
  ],
  [
    "p4",
    "AI Automation",
    "projectai",
    "Working local or mock-model workflow|Evaluation dataset and results|Human review and guardrails|Demo and documented failure cases",
  ],
  [
    "p5",
    "BA + Data + Automation + AI",
    "projectfinal",
    "Requirements and architecture|Integrated dashboard and automation|AI evaluation and regression tests|Case study, demo and ROI analysis",
  ],
];
definitions.forEach(([id, , ,], i) => {
  skills.find((s) => s.id === definitions[i][2])!.projectId = id;
});
// Associate each supporting skill with the earliest project that uses it.
definitions.forEach(([id, , root]) => {
  const visited = new Set<string>();
  function link(key: string) {
    if (visited.has(key)) return;
    visited.add(key);
    const skill = skills.find((s) => s.id === key);
    if (!skill) return;
    skill.projectId ??= id;
    skill.prerequisites.forEach(link);
  }
  link(root);
});
export const checkpoints: Checkpoint[] = [
  {
    id: "c1",
    title: "BA Entry Level",
    weeks: "3–4",
    roles: [
      "Business Analyst Trainee",
      "Junior Business Analyst",
      "Process Analyst Trainee",
    ],
    requirements: ["projectba"],
    projects: ["p1"],
  },
  {
    id: "c2",
    title: "BA + Data / BI Junior",
    weeks: "8–10",
    roles: [
      "Data Analyst Jr",
      "BI Analyst Jr",
      "Reporting Analyst",
      "Business Data Analyst",
      "BI Business Analyst Jr",
    ],
    requirements: ["projectdata", "stats"],
    projects: ["p1", "p2"],
  },
  {
    id: "c3",
    title: "BA + Data + Automation",
    weeks: "14–18",
    roles: [
      "Process Automation Analyst",
      "Power Platform Analyst",
      "Automation Analyst Jr",
      "Data & Process Automation Analyst",
    ],
    requirements: ["projectauto"],
    projects: ["p1", "p2", "p3"],
  },
  {
    id: "c4",
    title: "Applied AI / AI Automation Jr",
    weeks: "16–20",
    roles: [
      "AI Automation Analyst Jr",
      "AI Operations Analyst",
      "Business Automation Analyst",
    ],
    requirements: ["projectai"],
    projects: ["p1", "p2", "p3", "p4"],
  },
  {
    id: "c5",
    title: "Complete Hybrid Profile",
    weeks: "22–28",
    roles: [
      "AI Business Analyst Jr",
      "Data & AI Analyst",
      "Intelligent Automation Analyst",
      "AI Solutions Analyst Jr",
    ],
    requirements: ["projectfinal", "portfolio"],
    projects: ["p1", "p2", "p3", "p4", "p5"],
  },
];
export function initialData(): Data {
  return structuredClone({
    version: 1,
    skills,
    projects: definitions.map(([id, title, requirement, items]) => ({
      id,
      title,
      requirements: [requirement],
      status: "Not started",
      notes: "",
      links: "",
      github: "",
      start: "",
      end: "",
      deliverables: items.split("|").map((title) => ({ title, done: false })),
    })),
    settings: { hoursPerDay: 1, daysPerWeek: 5, theme: "dark" },
    activity: [],
  });
}
