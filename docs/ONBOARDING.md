# Guided setup

## Experience

A new workspace opens a three-step setup: welcome and language, starting direction, and study rhythm. Users can skip setup, go back without losing choices, and resume an interrupted first-run draft on the same device. Existing workspaces open normally. Everyone can reopen the guide from **Settings → Open guided setup**.

Finishing saves the selected focus and study pace, then opens an available competency. If the chosen area has unresolved prerequisites, the recommendation uses an available prerequisite instead. The recommendation never marks skills as learned or projects as completed. All roadmap areas remain available; focus is a starting preference rather than a restriction.

New workspaces start with one hour per day, five days per week. Existing users retain their stored pace unless they explicitly change it. Skipping saves the existing defaults and a completion marker. Canceling a replay leaves workspace data untouched. Language selection applies immediately as a device preference, even if the user leaves setup.

## Persistence and recovery

Completed setup is stored in the optional `settings.onboarding` field of version 1 backups. Older backups without this field remain valid. A workspace containing saved data is treated as an existing workspace, so upgrading does not force onboarding.

The temporary first-run draft is stored under `noryum-setup-draft-v1` in device-local storage. An invalid or unavailable draft falls back to safe defaults. If saving fails, the guide remains open, keeps the choices and offers a retry. The wizard only closes after the workspace is saved successfully.

## Design rationale and sources

- **Keep education connected to real tasks.** [NN/g: Onboarding Tutorials vs. Contextual Help](https://www.nngroup.com/articles/onboarding-tutorials/) favors contextual guidance over long instructions that users may forget. The guide ends with an actual competency rather than a decorative success screen.
- **Make progress and choices clear.** [W3C: Multi-page Forms](https://www.w3.org/WAI/tutorials/forms/multi-page/) recommends clear steps, progress information and an option to skip optional stages. The UI provides a labeled three-step indicator, a back action and a visible skip action.
- **Reduce uncertainty.** [W3C: Make Each Step Clear](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o1p04-clear-steps/) highlights the importance of knowing the current stage and what comes next. Each screen has one main task and a consistent next action.

The three-step structure and default five-hour weekly pace are Noryum design decisions, not values prescribed by these sources. The flow asks for no account, contact information or experience claims. It is available in English and professional Latin American Spanish.

## Accessibility and validation

The steps use `aria-current`, headings receive focus after navigation, and native labeled form controls support keyboard interaction. Numeric limits are validated in the form and again before persistence. Save errors use an alert region. The layout supports scrolling at small window heights and respects the existing light/dark theme.

Automated browser checks cover first run, language switching, backward navigation, draft resume, invalid inputs, simulated save failure and retry, completion persistence, skip, replay/cancel, and older workspaces without an onboarding marker. Logic tests cover recommendations and preservation of learning records.
