import type { Skill } from "./model";

export const contextEngineering: Skill = {
  id: "context",
  title: "Context Engineering",
  branch: "Applied AI",
  status: "Not started",
  priority: "High",
  hours: 24,
  prerequisites: ["prompt", "rag", "eval", "tools"],
  objective:
    "Design and evaluate the information supplied to a business AI workflow: instructions, retrieved evidence, tool results and memory, within a measured token budget.",
  criteria: [
    "Separate trusted instructions from untrusted documents and tool results; record source, date and access scope for each context item.",
    "Build a context manifest with task, constraints, examples, evidence and output schema; reserve room for the response and tool calls within the model limit.",
    "Compare a full-context baseline with selective retrieval on at least 20 held-out business questions, including missing, conflicting and outdated evidence; report citation accuracy, abstention, tokens and latency.",
    "Use relevance filtering, deduplication and explicit source references; test whether chunk context or reranking improves retrieval before adding complexity.",
    "Compact a multi-turn history while retaining decisions, constraints, unresolved questions and source references; verify that the next task still has the information it needs.",
    "Define memory scope, retention, correction and deletion rules; test that one user's or project's information cannot enter another context.",
    "Test malicious instructions in retrieved content, oversized tool results and unavailable sources; enforce permissions outside the model and require human approval for consequential actions.",
    "Deliver a reproducible context assembly workflow, versioned fixtures and an evaluation report for the AI Automation project; distinguish mock-system checks from actual model-quality results.",
  ],
  evidence:
    "Build a business policy assistant using synthetic documents with citations, a context manifest, a token budget, a memory policy and a baseline-versus-retrieval evaluation report.",
  notes: "",
  resources: [
    {
      title: "Anthropic: Effective context engineering for AI agents",
      url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents",
    },
    {
      title: "LangChain: Context engineering strategies",
      url: "https://www.langchain.com/blog/context-engineering-for-agents",
    },
    {
      title: "Anthropic: Contextual Retrieval",
      url: "https://www.anthropic.com/engineering/contextual-retrieval",
    },
    {
      title: "Anthropic: Writing effective tools for agents",
      url: "https://www.anthropic.com/engineering/writing-tools-for-agents",
    },
    {
      title: "OWASP: Prompt injection prevention",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html",
    },
    {
      title: "Research: Lost in the Middle",
      url: "https://arxiv.org/abs/2307.03172",
    },
  ],
  custom: false,
  projectId: "p4",
};
