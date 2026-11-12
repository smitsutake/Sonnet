# AMMBER - Project Handover

This document is the handover package for the AMMBER project. It is written for the client and for future maintainers.

**Handover meeting:** 16/11/2026. The meeting was scheduled after Week 14 because the client was overseas, with the approval of the team's tutor.

---

## Table of Contents

1. [Project Background / Overview](#1-project-background--overview)
2. [Demo](#2-demo)
3. [Features](#3-features)
4. [Documentation](#4-documentation)
5. [System Requirements](#5-system-requirements)
6. [Installation Guide](#6-installation-guide)
7. [Changelog](#7-changelog)
8. [Traceability Matrix](#8-traceability-matrix)
9. [Client Quick Guide](#9-client-quick-guide)
10. [Architecture & Key Components](#10-architecture--key-components)
11. [Key Algorithms](#11-key-algorithms)
12. [Data Documentation](#12-data-documentation)
13. [Deployment & Known CI/CD Issues](#13-deployment--known-cicd-issues)
14. [Outstanding Items & Future Work](#14-outstanding-items--future-work)
15. [Access & Ownership Transfer](#15-access--ownership-transfer)
16. [License](#16-license)
17. [Contact](#17-contact)

---

## 1. Project Background / Overview

AMMBER (A Motivational Model Builder for Essential Requirements) is a web-based tool for building motivational models. It helps requirements engineers and researchers quickly create hierarchical models of stakeholder goals, including:

- Functional goals (Do)
- Quality goals (Be)
- Emotional goals (Feel)
- Concerns
- Stakeholders (Who)

The tool supports building, arranging, rendering, exporting, and reviewing motivational models.

**Client:** Prof. Leon Sterling (University of Melbourne)

---

## 2. Demo

**Live Demo:** the app is not hosted as part of this handover. To run it locally, see Section 6. Notes on deploying it to GitHub Pages are in Section 13.

**Repository:**
- Main: `MotivationalModelling/mm-local-editor` (the original editor this project is based on)
- Team: `smitsutake/Sonnet` (this repository, transferred to the client at handover)

**Branches:** the latest, fully tested code is on the `develop` branch. All feature branches have been merged into `develop`, and all CI checks on `develop` pass.

---

## 3. Features

Features are organized by sprint. Each feature corresponds to one or more Jira tasks and a GitHub branch.

### Sprint 1

- Feedback data model [AMBR-9]
- Grading data model and scoring [AMBR-10] (Implemented on the `grade-system` branch, then rejected by client; not included in `develop`)
- Link feedback comments to goals [AMBR-11]
- Route feedback arrows around other nodes [AMBR-12]
- Focused layout while reviewing [AMBR-13]
- Plain-model export [AMBR-14]
- Mark model entry point on the welcome page [AMBR-15]
- Color palette proposal [AMBR-23] (Rejected by client, not implemented)
- Logo design [AMBR-24] (Not implemented: the team decided to keep the current logo)
- Theme application across UI [AMBR-25] (Rejected by client, not implemented)
- Hover feedback on action buttons [AMBR-26]

### Sprint 2

- Auto-save version checkpoint [AMBR-36]
- Manually save a named checkpoint [AMBR-37]
- View list of saved versions [AMBR-38]
- Restore a previous version [AMBR-39]
- Rename or delete a saved version [AMBR-40]
- driver.js guided tour [AMBR-20, AMBR-21, AMBR-22]
- Manual audit and update [AMBR-16, AMBR-17, AMBR-18, AMBR-19]

### Sprint 3

- Triage and log known bugs [AMBR-27]
- Fix data structure sync bugs [AMBR-28]
- Set up weekly debug session [AMBR-29]
- Debug session: Goal List pane [AMBR-30]
- Debug session: Hierarchy & Model [AMBR-31]
- Log & prioritise new debug findings [AMBR-32]

### UI/UX Improvements (Cross-Sprint)

- Papers modal with research report series [AMBR-43]
- Canvas and Tree empty state guidance [AMBR-44, AMBR-47]
- Canvas drag highlight [AMBR-45]
- Tree node drag hover highlight [AMBR-46]
- Keyboard shortcuts (Ctrl+S/A/D/E) [AMBR-48]
- Ctrl+E then P/S for direct export [AMBR-54] (Ctrl+E opens the Export menu; P/S keys are not implemented, choose PNG or SVG with the mouse)
- Toast notifications for save, export and duplicate

---

## 4. Documentation

Project documentation was written in the team's Confluence space, which the client does not have access to. The key documents are exported as PDF and stored in the `docs/` folder of this repository.

### Key Documents

| Document | Location |
|---|---|
| Requirement Document (including the motivational model) | `docs/requirements.pdf` |
| User Stories | `docs/user-stories.pdf` |
| Persona | `docs/personas.pdf` |
| Architectural Diagram | `docs/architecture.pdf` |
| Test Plan | `docs/test-plan.pdf` |
| Client Meeting Logs | `docs/meeting-logs/` (one PDF per meeting) |
| User Manual (PDF) | `public/papers/AMMBER_User_Manual.pdf` |
| User Manual (web) | In the app at `/user-manual-web` (opened from the welcome page footer); source in `src/UserManual/` |
| Sample models for testing | `sample-models/` (see `sample-models/README.md`) |

**Note on the User Manual:** both versions of the manual describe grading (assigning grades or scores, and students viewing their grade). These descriptions were included by mistake. Grading was implemented on the `grade-system` branch but rejected by the client, so it is not included in the delivered version (`develop`), and the "Mark model" and "Review Model" buttons only handle feedback comments. We recommend removing the grading descriptions from the manual. They appear in:
- Web manual (`src/UserManual/UserManualWeb.tsx`): the descriptions of the "Review Model" and "Mark model" buttons in Section 2.2.1
- PDF manual: the Staff Mode and "Mark model" descriptions, and Section 3.8 "Student Reviewing Grade and Feedback"

---

## 5. System Requirements

### Runtime Environment

| Tool | Version |
|---|---|
| Node.js | v20.19.0 or higher (required by Vite 8 and Vitest 4) |
| npm | v9 or higher (bundled with Node.js) |
| Modern browser | Chrome, Edge, or Firefox (latest) |

### Main Dependencies

| Library | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 8.x | Build tool |
| maxGraph | 0.13.x | Graph rendering |
| Redux Toolkit | 2.x | State management (`createSlice` reducer) |
| Bootstrap / React Bootstrap | 5.x / 2.x | UI components |
| React Router | 6.x | Page routing |
| idb-keyval | 6.x | IndexedDB storage for version history |
| zod | 3.x | Validation of feedback data in model files |
| react-hot-toast | 2.x | Toast notifications |
| driver.js | 1.x | Guided tour |
| Vitest | 4.x | Unit testing |
| Cypress | 15.x | E2E testing |

### Data Storage

AMMBER is a **local-first application**:
- Models are saved as **JSON files** on the user's computer
- Version history is stored in **IndexedDB** (browser-based)
- **No external database is used**

---

## 6. Installation Guide

### Prerequisites

- Node.js v20.19.0 or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/smitsutake/Sonnet.git
cd Sonnet

# Use the latest code
git checkout develop

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open http://localhost:5173/mm-local-editor/.

### Production Build

```bash
npm run build
```

Output is written to `dist/`.

### Running Tests

```bash
npm test                # Unit tests (Vitest)
npx cypress run         # E2E tests (headless)
npx cypress open        # E2E tests (interactive)
```

### Shutdown

Press Ctrl + C in the terminal.

### Deployment

The application is deployed via GitHub Actions to GitHub Pages. See Section 13 and `.github/workflows/` for details.

---

## 7. Changelog

### Sprint 3

- Triage and log known bugs
- Fix data structure sync bugs
- Weekly debug sessions
- All feature branches merged into `develop`

### Sprint 2

- Feedback system: data model, comment linking, arrow routing, focused layout, plain-model export, welcome entry point
- Version history: auto-save, manual save, view list, restore, rename/delete
- driver.js guided tour: onboarding, tooltips, step counting, model toolbar steps
- User manual audit and updates
- UI/UX improvements: Papers modal, empty state guidance, drag highlight, keyboard shortcuts, Ctrl+E export menu shortcut, Toast notifications

### Sprint 1

- Feedback data model [AMBR-9]
- Grading data model and scoring [AMBR-10] (Implemented on the `grade-system` branch, then rejected by client; not included in `develop`)
- Link feedback comments to goals [AMBR-11]
- Route feedback arrows around other nodes [AMBR-12]
- Focused layout while reviewing [AMBR-13]
- Plain-model export [AMBR-14]
- Mark model entry point on welcome page [AMBR-15]
- Color palette proposal [AMBR-23] (Rejected by client, not implemented)
- Logo design [AMBR-24] (Not implemented: the team decided to keep the current logo)
- Theme application across UI [AMBR-25] (Rejected by client, not implemented)
- Button hover feedback [AMBR-26]

**Version tags:** see the repository's **Tags** page (created automatically by `release-version.yml`, e.g. `2026.1`).

---

## 8. Traceability Matrix

This table links each feature to the Jira task that implemented it and the tests that check it. Automated tests run with `npm test` (Vitest). Features marked "Manual" were checked by hand against the Test Plan.

| Feature / User Story | Jira | Test | Status |
|---|---|---|---|
| Feedback data model | AMBR-9 | `feedback/feedbackTypes.test.ts` | Done |
| Grading data model and scoring | AMBR-10 | (on `grade-system` branch) | Rejected by client |
| Link feedback comments to goals | AMBR-11 | `feedback/feedbackFlow.test.tsx`, `feedback/feedbackGeometry.test.ts` | Done |
| Route feedback arrows around other nodes | AMBR-12 | `feedback/arrowRouting.test.ts`, `feedback/graphAnchors.test.ts`, `feedback/feedbackArrows.test.tsx` | Done |
| Focused layout while reviewing | AMBR-13 | Manual | Done |
| Plain-model export | AMBR-14 | Manual | Done |
| Mark model entry point on the welcome page (Staff mode) | AMBR-15 | `feedback/staffMode.test.tsx`, `feedback/feedbackFlow.test.tsx` (teacher gate) | Done |
| Color palette proposal | AMBR-23 | | Rejected by client |
| Logo design | AMBR-24 | | Not implemented (current logo kept) |
| Theme application across UI | AMBR-25 | | Rejected by client |
| Hover feedback on action buttons | AMBR-26 | Manual | Done |
| US-VH-01 Auto-save version checkpoint | AMBR-36 | `model-version-control/versionStorage.test.ts`, `context/modelId.test.ts`, Manual | Done |
| US-VH-02 Manually save a named checkpoint | AMBR-37 | Manual | Done |
| US-VH-03 View list of saved versions | AMBR-38 | Manual | Done |
| US-VH-04 Restore a previous version | AMBR-39 | Manual | Done |
| US-VH-05 Rename or delete a saved version | AMBR-40 | Manual | Done |
| driver.js guided tour | AMBR-20, AMBR-21, AMBR-22 | `tour/tourSteps.test.ts`, `tour/tourFlow.test.ts`, `tour/tourLifecycle.test.ts`, `tour/tourPolicy.test.ts`, `tour/useTour.test.ts`, `tour/useAutoTour.test.ts` | Done |
| User manual audit and update | AMBR-16 to AMBR-19 | Manual (reviewed against the app) | Done |
| Fix data structure sync bugs | AMBR-28 | `context/treeDataSlice.test.ts`, `context/FileProvider.test.tsx` | Done |
| Papers modal with research report series | AMBR-43 | Manual | Done |
| Canvas and Tree empty state guidance | AMBR-44, AMBR-47 | Manual | Done |
| Canvas drag highlight | AMBR-45 | Manual | Done |
| Tree node drag hover highlight | AMBR-46 | Manual | Done |
| Keyboard shortcuts (Ctrl+S/A/D/E) | AMBR-48 | Manual | Done |
| Ctrl+E then P/S for direct export | AMBR-54 | Manual | Ctrl+E done; P/S not implemented |
| Toast notifications | | Manual | Done |

All test files are under `src/components/`. End-to-end tests for deleting goals and changing font size are in `cypress/e2e/`.

---

## 9. Client Quick Guide

This section is for the client. No programming knowledge is needed.

- **Open the app:** the app is not hosted at handover. A developer can run it locally (Section 6) or deploy it to GitHub Pages (Section 13).
- **How to use it:** click **User Manual** at the bottom of the welcome page, or open `public/papers/AMMBER_User_Manual.pdf`. A step-by-step **Guide** (guided tour) also opens automatically when you enter the editor, and can be reopened at any time with the **Guide** button.
- **Saving a model:** clicking **Save** (or Ctrl+S / Cmd+S) writes the model to a `.json` file on your computer. Keep these files somewhere safe (for example, a cloud-synced folder). The `.json` file is the only permanent copy of a model.
- **Version history stays in your browser.** Every Save also creates an automatic checkpoint, and you can save named checkpoints by hand. These checkpoints are stored inside the browser, not in the `.json` file. They will not appear if you open the model in a different browser or on a different computer, and they are lost if you clear your browser data. Up to 50 checkpoints are kept per model; when the limit is reached, the oldest automatic checkpoints are removed first.
- **Reviewing student models (Staff mode):** click **Staff mode**, answer **Yes**, and type your name. Then use **Mark model** on the welcome page to open a student's model and add feedback comments. Your name is attached to every comment you write and is kept only while the tab is open. This step is not a password: anyone can enter Staff mode.
- **Students reading feedback:** students open a reviewed model with **Review Model** on the welcome page. Opening it with **Open Model** shows the model without feedback.
- **If you want changes made in the future:** give the developer the link to this repository and this document. Sections 5, 6 and 10 to 13 explain everything they need to get started.

---

## 10. Architecture & Key Components

See also: Architectural Diagram (`docs/`).

AMMBER is a single-page React application with no backend. Everything runs in the user's browser.

### Repository Structure

| Path | Purpose |
|---|---|
| `src/main.tsx`, `src/App.tsx` | Entry point, toast setup and routing (`/`, `/papers`, `/projectEdit`, `/user-manual-web`, under the base path `/mm-local-editor/`) |
| `src/components/Welcome*.tsx` | Welcome page: Create Model, Open Model, Review Model, Mark model (staff mode only) |
| `src/components/ProjectEdit.tsx`, `SectionPanel.tsx` | Main editor screen and its panels |
| `src/components/GoalList.tsx`, `GoalListTable.tsx` | Goal List pane (goals grouped by Do / Be / Feel / Concern / Who) |
| `src/components/Tree.tsx` | Hierarchy pane (drag-and-drop goal tree) |
| `src/components/Graphs/` | Model rendering with maxGraph, including layout (`GoalModelLayout.tsx`), drawing and keyboard shortcuts (`GraphWorker.tsx`, `GraphShapes.tsx`) and the sidebar for colours, lines and zoom |
| `src/components/context/` | Application state: `FileProvider.tsx` (loading/saving model data), `treeDataSlice.ts` (state reducer built with Redux Toolkit's `createSlice`), `GraphContext.tsx` (shared maxGraph instance), `modelId.ts` (stable model id) |
| `src/components/feedback/` | Teaching-staff feedback: Staff mode, comment panel, feedback arrows and their routing |
| `src/components/model-version-control/` | Version History: storage, list modal, restore |
| `src/components/tour/` | Guided tour (driver.js): steps, when it opens automatically, Guide button |
| `src/components/header/` | Toolbar buttons: Save, Export, Home, show/hide sections |
| `src/UserManual/` | Web version of the User Manual and its screenshots |
| `src/data/` | Static data: initial tabs, list of research papers |
| `public/papers/` | Research report PDFs and the PDF User Manual |
| `sample-models/` | Sample `.json` models for manual testing |
| `cypress/` | End-to-end tests |
| `.github/workflows/` | CI, deployment and release automation (see Section 13) |

Unit tests (`*.test.ts`, `*.test.tsx`) are placed next to the files they test.

### Where to Make Common Changes

| If you want to change... | Look in |
|---|---|
| Feedback comments, Staff mode | `src/components/feedback/` |
| Feedback arrow drawing / routing | `src/components/feedback/FeedbackArrows.tsx`, `arrowRouting.ts`, `graphAnchors.ts` |
| Version history | `src/components/model-version-control/` |
| Guided tour content | `src/components/tour/tourSteps.ts` |
| Keyboard shortcuts | `src/components/Graphs/GraphWorker.tsx` (`handleKeyDown`) |
| Saving / opening files | `src/components/header/SaveFileButton.tsx`, `src/components/context/FileProvider.tsx` |
| Export (PNG / SVG) | `src/components/header/ExportFileButton.tsx` |
| Model layout and appearance | `src/components/Graphs/` |
| User Manual (web) | `src/UserManual/UserManualWeb.tsx` |
| Papers page | `src/components/Papers.tsx`, `src/data/papers.ts` |

---

## 11. Key Algorithms

| Algorithm | File | Description |
|---|---|---|
| Feedback arrow routing | `src/components/feedback/arrowRouting.ts` | Arrows from a comment to a goal are routed around other shapes so they do not cover labels. It is a bounded detour heuristic, not general path finding: try the straight segment; if it crosses a shape (Liang-Barsky clipping test), step over or under that shape, whichever is nearer; repeat on the two halves up to a depth of 4. If the depth runs out, the last segment is drawn as-is. |
| Locating goals on the rendered model | `src/components/feedback/graphAnchors.ts`, `feedbackGeometry.ts` | maxGraph draws on its own surface, so there is no DOM element per goal. Goal positions are read from the maxGraph instance through stable cell ids, then converted to screen coordinates for the arrows. |
| Model layout | `src/components/Graphs/GoalModelLayout.tsx` | Custom layout based on maxGraph's `CompactTreeLayout`. |
| Version history pruning | `src/components/model-version-control/versionStorage.ts` | At most 50 checkpoints per model. Named (manual) checkpoints claim their slots first; automatic ones fill the remaining slots, so automatic checkpoints are always removed before manual ones. |
| Stable model identity | `src/components/context/modelId.ts` | Each model stores its own id inside the `.json` file. Version history is keyed on this id, not on the file name, so history follows the model even if the file is renamed, moved or copied. Files saved before this feature are given an id the first time they are opened. |
| Feedback backwards compatibility | `src/components/feedback/feedbackTypes.ts` | The `feedback` key is optional and validated with zod. Files without it load as before; when such a file is saved again it is stamped `unfeedbacked`. |
| Guided tour auto-open | `src/components/tour/tourPolicy.ts`, `useAutoTour.ts` | The tour opens automatically when the editor is entered, except under Cypress tests. It can be forced on or off with `?tour=on` / `?tour=off` in the URL (remembered for the browser tab). |
| PNG / SVG export | `src/components/header/ExportFileButton.tsx` | Serialises the maxGraph SVG. PNG is rendered onto a canvas at 3x scale. |

---

## 12. Data Documentation

### Model File (JSON)

Defined by `JSONData` in `src/components/context/FileProvider.tsx`.

| Field | Description |
|---|---|
| `tabData` | The five goal categories (Do, Be, Feel, Concern, Who), each with its label, icon and the ids of the goals it contains |
| `treeData` | The goal hierarchy. Each node has `id`, `content`, `type`, `instanceId` and `children` |
| `feedback` (optional) | Teaching-staff feedback: `status` (`feedbacked` / `unfeedbacked`), `items` (each comment with `id`, `content`, `author`, `createdAt`, and `targets`, the goals it points at) and `updatedAt` |
| `modelId` (optional) | Stable id used to key version history |

### Browser Storage

| Storage | Key | Contents |
|---|---|---|
| localStorage | `ammber/treeData`, `ammber/tabData`, `ammber/modelId` | The model currently open in the editor |
| IndexedDB (via `idb-keyval`, default database) | `ammber/versionHistory/<modelId>` | List of checkpoints for one model. Each checkpoint has `id`, `label`, `createdAt`, `auto` and a full `snapshot` of the model |
| sessionStorage | `ammber.tour` | Guided tour on/off override for the current tab |

### Sample / Test Data

`sample-models/` contains two dummy models (no real student data):

- `student-model-no-feedback.json`: a model in the format used before the feedback feature
- `student-model-reviewed.json`: the same model with two comments and three arrows

---

## 13. Deployment & Known CI/CD Issues

### Workflows

Three GitHub Actions workflows are in `.github/workflows/`:

| Workflow | Trigger | What it does |
|---|---|---|
| `ci-cd.yml` | Push to any branch; pull requests into `develop` | Runs unit tests, a build check and Cypress E2E tests (Node 20). On a push to `develop`, it then deploys to GitHub Pages with `npm run deploy` (`gh-pages`). |
| `deploy.yml` | Push to `main` | Builds the app (Node 18) and publishes `dist/` to GitHub Pages. |
| `release-version.yml` | Push to `main` | Creates the next version tag in the form `YEAR.N` (e.g. `2026.1`) and updates `version` in `package.json`. |

All checks pass on `develop`.

### Known CI/CD Issues at Handover

During the final handover, the automated pipelines on the `main` branch failed. Note that the application code itself is fully functional, built, and tested (all checks pass on `develop`); these failures are strictly due to outdated CI/CD configurations. There are three root causes:

- **Deploy (Node.js Version Mismatch):** `deploy.yml` builds with Node.js v18, while the latest Vite dependencies require Node.js v20+.
- **CI/CD (Cypress Timeout):** in `ci-cd.yml`, Cypress times out trying to connect to the Vite dev server (`Socket closed before the connection was established`). This happened on `main` even though the same job passes on `develop`, so it is likely an intermittent issue on the GitHub runner.
- **Release Version (Duplicate Git Tag):** `release-version.yml` tries to create a version tag (`2026.1`) that already exists. The workflow checks out with `fetch-depth: 1`, so `git describe` cannot see the existing tag and the version calculation starts again from `YEAR.1`.

### Suggested Fix for Future Maintainers

- Update `node-version` in `.github/workflows/deploy.yml` to `'20'` or `'lts/*'`.
- In `ci-cd.yml`, add the `--host` flag to the Vite dev server command and increase the Cypress `wait-on` timeout.
- In `release-version.yml`, use `fetch-depth: 0` and check whether a tag already exists before creating it.

### GitHub Pages after the Transfer

- The app runs under the path `/mm-local-editor/` (`basename` in `src/App.tsx`), but GitHub Pages serves a repository at `https://<owner>.github.io/<repository name>/`. If the repository is still named `Sonnet`, the page may load blank. Renaming the repository to `mm-local-editor` fixes this without changing any code.
- After the transfer, check **Settings → Pages** (source: `gh-pages` branch) and **Settings → Actions → General → Workflow permissions** ("Read and write", needed for deployment).

---

## 14. Outstanding Items & Future Work

### Unimplemented User Stories / Features

All user stories accepted by the client have been implemented, with these exceptions:

| Feature | Jira | Reason |
|---|---|---|
| P/S keys after Ctrl+E for direct export | AMBR-54 | Ctrl+E opens the Export menu; choosing PNG or SVG by key was not implemented |
| Logo design | AMBR-24 | Suggested by the client as an optional extra. The team reviewed it and judged the current logo to be the best fit, so no new logo was made |

### Rejected by Client

The following features were built and shown to the client, but rejected because they did not fit the client's vision for AMMBER. They are not included in the delivered version.

| Feature | Jira | Reason |
|---|---|---|
| Grading data model and scoring (kept on the `grade-system` branch) | AMBR-10 | Did not fit the client's vision for AMMBER |
| UI colour change (color palette proposal, theme application across UI) | AMBR-23, AMBR-25 | Did not fit the client's vision for AMMBER |

### Known Limitations

| Limitation | Details |
|---|---|
| Grading in the User Manual | The manual describes grading, which is not included in the delivered version. See the note in Section 4. |
| Staff mode is not access control | The "Are you a teacher?" step is a placeholder. Anyone can enter Staff mode. The code is structured so a real password check can replace it later without changing the rest of the feature (`TeacherGateModal.tsx`). |
| Version history is tied to one browser | Checkpoints are stored in IndexedDB and are not included in the `.json` file, so they do not move with the file. |
| CI/CD on `main` | See Section 13. |

### Suggested Future Improvements

- Remove the grading descriptions from the User Manual if grading is not needed
- Replace the Staff mode placeholder with a real credential check
- Allow version history to be exported and imported together with the model
- A "browse all my models" view of stored version histories (`storedModelIds()` in `versionStorage.ts` already lists them)

---

## 15. Access & Ownership Transfer

The GitHub repository is transferred to the client at the handover meeting (16/11/2026).

| Item | Current owner | Transferred to | Status |
|---|---|---|---|
| GitHub repository (`smitsutake/Sonnet`) | smitsutake | Prof. Leon Sterling | To be completed at the handover meeting |
| GitHub Pages (deployment) | smitsutake | Moves with the repository | To be checked after transfer (see Section 13) |
| Confluence space | Student team | Not transferred | Key documents exported as PDF to `docs/` (see Section 4) |

The application does not use any third-party API keys, external accounts or backend services. Deployment uses only the repository's built-in `GITHUB_TOKEN`.

---

## 16. License

See the `LICENSE` file in the repository root. All additions and changes made by the team are transferred to the client.

### Third-Party Licenses

| Library | License |
|---|---|
| React, React DOM | MIT |
| @maxgraph/core | Apache-2.0 |
| Redux Toolkit, immer | MIT |
| Bootstrap, React Bootstrap | MIT |
| d3 | ISC |
| zod | MIT |
| idb-keyval | Apache-2.0 |
| @dnd-kit, dnd-kit-sortable-tree | MIT |
| react-router-dom | MIT |
| react-hot-toast | MIT |
| driver.js | MIT |
| file-saver, canvg | MIT |
| react-icons, react-color, re-resizable, react-device-detect | MIT |
| react-nestable | ISC |
| Vite, Vitest | MIT |
| Icons in `public/img/` | MIT (see `public/img/LICENSE`) |

---

## 17. Contact

| Name | Role | Contact |
|---|---|---|
| Sotaro Mitsutake | Scrum Master | smitsutake@student.unimelb.edu.au |
| Yanzhe Chen | Product Manager | yanzhe@student.unimelb.edu.au |
| Haidong Tang (Rocky) | Vice Product Manager | haidtang@student.unimelb.edu.au |
| Taishen Yang | Developer | taishen.yang@student.unimelb.edu.au |
| Yilan Fang | Developer | yilanf@student.unimelb.edu.au |

---

Last updated: 12/11/2026
