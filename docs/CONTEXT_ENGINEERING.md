# Context engineering learning unit

Research reviewed: September 20, 2026. Curriculum introduced in Noryum 0.5.0.

## Placement and learning outcome

**Applied AI → Context Engineering**, after Prompt Engineering, RAG Fundamentals, AI Evaluation and Tool / Function Calling. It supports AI Agents Fundamentals, AI Solution Design and the AI Automation project (checkpoint 4). The estimated **24 hours** are an editorial study estimate, not a certification requirement or a guarantee of mastery.

The learner designs the information available to a model at each step: instructions, examples, retrieved evidence, tool descriptions/results and selected memory. Prompt engineering focuses on instructions; RAG supplies retrieved knowledge; context engineering coordinates the whole information lifecycle. MCP is an integration protocol, not a replacement for that design.

## Evidence and design decisions

| Source | Finding used in the curriculum | Application |
| --- | --- | --- |
| [Anthropic: Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | Context is finite; relevance and coherent state management matter. | Budget tokens, retrieve only useful material and verify compaction preserves task state. |
| [LangChain: Context engineering](https://www.langchain.com/blog/context-engineering-for-agents) | Write, select, compress and isolate describe distinct context operations. | Separate durable memory from per-request evidence; test project/user boundaries and summary quality. |
| [Anthropic: Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) | Chunk-specific context and retrieval improvements can help recover relevant evidence. | Compare retrieval variants against a simple baseline before adding reranking or contextual chunking. Published gains are workload-specific. |
| [Anthropic: Writing effective tools](https://www.anthropic.com/engineering/writing-tools-for-agents) | Clear tool contracts and useful, concise responses improve agent interaction. | Bound result sizes, preserve references and test ambiguous or failed tool calls. |
| [OWASP: Prompt injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) | Retrieved content and tool outputs can carry malicious instructions; layered controls are needed. | Treat external text as untrusted, enforce permissions in code and require approval for consequential actions. Delimiters and prompts alone are not security boundaries. |
| [Liu et al.: Lost in the Middle](https://arxiv.org/abs/2307.03172) | Evaluated models could fail to use information in long contexts, with sensitivity to position. | Test evidence placed at different positions and under distraction. Historical results are not a universal benchmark for every current model. |

## Practical assignment: business policy assistant

Use synthetic purchasing or expense-policy documents. Include valid policies, a superseded version, conflicting clauses, irrelevant material, a document containing malicious instructions and a question whose answer is unavailable. Do not use private company documents or real personal data.

1. Define the business decision, permitted sources, expected answer schema and escalation conditions. Prepare a manifest recording source ID, version/date, access scope and reason for inclusion.
2. Build a full-context baseline on a corpus that fits the selected model. Then implement selective retrieval. Use a local model when available; a deterministic mock can validate assembly, permissions and failure paths, but cannot establish model answer quality.
3. Set a model-specific input budget and reserve output/tool-call space. Measure with the model tokenizer when available; label estimates. Apply relevance filtering and deduplication, retain source references, and reject or truncate oversized results deliberately. There is no universal ideal token budget or chunk size.
4. Use separate development questions and at least **20 held-out evaluation questions**. This is a starter learning exercise, not a statistically sufficient production evaluation. Cover missing, conflicting, stale and malicious evidence. Record expected supporting source IDs and expected abstentions before tuning.
5. Report retrieval recall against expected sources, answer correctness, citation support, abstention behavior, input/output tokens and latency. Compare the same model/settings across variants, record model/version and repeat unstable cases. Include failures and tradeoffs; do not report fabricated model results from mocks.
6. Simulate a long conversation. Compact it into decisions, constraints, unresolved questions and source IDs, then check whether a follow-up question remains answerable. Keep the original trace for comparison.
7. Define memory ownership, retention, correction and deletion. Test cross-user/project isolation in application code, not just through instructions. Add adversarial documents, unavailable sources, tool errors and unauthorized actions to the regression set.
8. Deliver the assembly workflow, manifest, synthetic fixtures, evaluation table, memory policy and limitations as evidence for **AI Automation (p4)**. Link the repository/report in the competency evidence field and the project links.

## Upgrade behavior

New workspaces have 93 competencies. Existing version-1 backups gain the unit when loaded or imported, provided its prerequisites exist and its ID is not already used. Personal status, notes, evidence, resources and project checklists are preserved. The update adds the new dependency to three unchanged built-in prerequisite lists only; customized lists and edges that would create cycles remain intact.

The optional `curriculumRevision: 1` marker prevents reapplying the update after a user removes or edits the unit. Reduced/custom backups and ID collisions remain unchanged apart from that marker. The data is persisted through the normal save flow; loading alone does not overwrite the saved file. Older application versions do not retain the new marker, so avoid round-tripping customized data through an older app.

Completion percentages and checkpoint estimates can change because there is new learning work; completed competency states are not reset. Interface content is available in English and professional Latin American Spanish. Canonical content and documentation remain English.
