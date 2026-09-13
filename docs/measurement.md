# Measuring Subjective States

MVP decision, 2026-09-12: four separate questions about current state, integer answers from **1-5**, optional note, and persisted scale version. These are personal self-reports designed for Noryum; **they are not a validated clinical instrument**.

## Why Five Levels

| Scale | Design Benefit | Cost |
| --- | --- | --- |
| 1-5 | Five options are easy to present and label; explicit midpoint. | Less resolution: small variations may fall into the same category. |
| 1-10 | More options for nuance and familiarity for some people. | No single center category; distinguishing neighboring values can be hard, and more numeric detail does not guarantee precision. |

The five-option choice is a UX inference for brief logging, not a scientific conclusion that five is always better. Real speed and label comprehension require user evaluation.

## Evidence Reviewed And Limits

- Preston and Colman studied 149 people rating services: several indices improved up to roughly seven categories, and preference was highest for ten. This supports considering more options, but it did not evaluate daily wellness check-ins. [Original study, 2000](https://pubmed.ncbi.nlm.nih.gov/10769936/).
- Cook and collaborators analyzed 434 responses about pain interference: recoding to five or six categories preserved useful results. The number of options shown to participants was not manipulated; it does not prove interface equivalence or validate Noryum's questions. [Original study, 2010](https://www.dovepress.com/is-less-more-a-preliminary-investigation-of-the-number-of-response-cat-peer-reviewed-fulltext-article-PROM).
- An EMA experiment with 411 participants found no significant main effects from the tested factors on compliance, including slider versus Likert. It did not directly compare 1-5 and 1-10, and it does not allow a promise that fewer options improve consistency. [Businelle and collaborators, 2024](https://www.jmir.org/2024/1/e50275/).
- A category-interpretation study found problems with treating categories as equally spaced intervals. This reinforces caution with averages and numeric interpretation, although its population and questions differ from Noryum. [Knutsson and collaborators, 2010](https://pubmed.ncbi.nlm.nih.gov/20576159/).

## Interpretation Contract

Energy, mood, stress, and concentration remain separate. A higher number means a higher level of the concept: for stress, it means **more stress**, with no silent inversion. Labels and questions should remain stable within the same scale version.

Answers are ordinal. MVP averages are approximate descriptions of recorded responses, not clinical measures or exact psychological distances. Do not present changes as health percentages or compare people. Preserving original observations, date, and version allows future methods to be revised without rewriting history.

Omit missing observations and show coverage. A day without a record does not imply a good or bad state. Multiple check-ins on one day may reflect different moments; the aggregation method must be explicit in [data-model.md](data-model.md). Recording times and voluntary selection can bias week-to-week comparisons.

Sleep records are personal estimates: time between bedtime and wake time is not necessarily time asleep. Do not apply automatic medical thresholds. Module progress describes declared progress, not retention or mastery. Relationships between variables, if added later, must be labeled as exploratory associations.

Before changing the scale, check category comprehension and use, gather feedback about friction, and document a new version. Do not automatically convert historical 1-5 values to 1-10 or mix versions in the same trend.
