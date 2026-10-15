# AMMBER - Project Handover

This document is the handover package for the AMMBER project. It is written for the client and for future maintainers.

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

**Live Demo:** (Add GitHub Pages URL once deployed)

**Repository:**
- Main: `MotivationalModelling/mm-local-editor`
- Team: `smitsutake/Sonnet`

---

## 3. Features

Features are organized by sprint. Each feature corresponds to one or more Jira tasks and a GitHub branch.

### Sprint 1

- Feedback data model [AMBR-9]
- Grading data model and scoring [AMBR-10]
- Link feedback comments to goals [AMBR-11]
- Route feedback arrows around other nodes [AMBR-12]
- Focused layout while reviewing [AMBR-13]
- Plain-model export [AMBR-14]
- Mark model entry point on the welcome page [AMBR-15]
- Color palette proposal [AMBR-23]
- Logo design [AMBR-24]
- Theme application across UI [AMBR-25]
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
- Ctrl+E then P/S for direct export [AMBR-54]

---

## 4. Documentation

All project documentation is available in Confluence:

**AMMBER Project Space:**
`https://student-team-sonnet.atlassian.net/wiki/spaces/AMMBER/overview`

### Key Documents

| Document | Location |
|---|---|
| Requirement Document | Confluence |
| Test Plan | Confluence |
| Client Meeting Log - Week 5 | Confluence |
| Client Meeting Log - Week 6 | Confluence |
| Persona | Confluence: Requirements Sprint1 |
| Architectural Diagram | Confluence: Requirements Sprint1 |
| User Stories | Confluence: Requirements Sprint2 |
| User Case Diagram (Version history) | Confluence: Requirements Sprint2 |
| UI/UX Interaction with Version History | Confluence: Requirements Sprint2 |

### Export as PDF

All Confluence pages can be exported as PDF. Use the `...` menu → **Export** → **PDF** in Confluence.

---

## 5. System Requirements

### Runtime Environment

| Tool | Version |
|---|---|
| Node.js | v18.18.0 or higher (v20 LTS recommended) |
| npm | v9 or higher (bundled with Node.js) |
| Modern browser | Chrome, Edge, or Firefox (latest) |

### Main Dependencies

| Library | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 8.x | Build tool |
| maxGraph | latest | Graph rendering |
| Redux Toolkit | 2.x | State management |
| Bootstrap | 5.x | UI components |
| react-hot-toast | 2.x | Toast notifications |
| driver.js | 1.x | Guided tour |
| Vitest | latest | Unit testing |
| Cypress | 15.x | E2E testing |

### Data Storage

AMMBER is a **local-first application**:
- Models are saved as **JSON files** on the user's computer
- Version history is stored in **IndexedDB** (browser-based)
- **No external database is used**

---

## 6. Installation Guide

### Prerequisites

- Node.js v18.18.0 or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/smitsutake/Sonnet.git
cd mm-local-editor

# Install dependencies
npm install

# Start the development server
npm run dev
Then open http://localhost:5173/mm-local-editor/.

Production Build
bash
npm run build
Output is written to dist/.

Running Tests
bash
npm test                # Unit tests (Vitest)
npx cypress run         # E2E tests (headless)
npx cypress open        # E2E tests (interactive)
```
Shutdown
Press Ctrl + C in the terminal.

Deployment
The application is deployed via GitHub Actions to GitHub Pages. See .github/workflows/ for details.

## 7. Changelog
Sprint 3 (In Progress)
Triage and log known bugs

Fix data structure sync bugs

Weekly debug sessions

Sprint 2
Feedback system: data model, grading, comment linking, arrow routing, focused layout, plain-model export, welcome entry point

Version history: auto-save, manual save, view list, restore, rename/delete

driver.js guided tour: onboarding, tooltips, step counting, model toolbar steps

User manual audit and updates

UI/UX improvements: Papers modal, empty state guidance, drag highlight, keyboard shortcuts, Ctrl+E then P/S export, Toast notifications

Sprint 1
Feedback data model [AMBR-9]

Grading data model and scoring [AMBR-10]

Link feedback comments to goals [AMBR-11]

Route feedback arrows around other nodes [AMBR-12]

Focused layout while reviewing [AMBR-13]

Plain-model export [AMBR-14]

Mark model entry point on welcome page [AMBR-15]

Color palette proposal [AMBR-23]

Logo design [AMBR-24]

Theme application across UI [AMBR-25]

Button hover feedback [AMBR-26]

## 8. Traceability Matrix
User Story	Jira Task	Test Case	Status
US-VH-01	AMBR-36	(Add TC ID)	In progress
US-VH-02	AMBR-37	(Add TC ID)	In progress
US-VH-03	AMBR-38	(Add TC ID)	In progress
US-VH-04	AMBR-39	(Add TC ID)	In progress
US-VH-05	AMBR-40	(Add TC ID)	In progress
(Expand this table with all user stories from Confluence.)

Last updated: (Add date)
