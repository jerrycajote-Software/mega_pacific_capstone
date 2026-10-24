# Automatic Documentation & Obsidian Second Brain Workflow

This guide explains how **Obsidian** and the repository **`docs/` folder** operate together as your project's **Second Brain**, and how documentation updates are automatically maintained when modifying the codebase.

---

## 1. Dual-Layer Documentation System

```
                  ┌─────────────────────────────────────────┐
                  │          OBSIDIAN VAULT ROOT            │
                  │       (Opened at mega_pacific/)         │
                  └────────────────────┬────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  OFFICIAL KNOWLEDGE BASE     │              │    OBSIDIAN SECOND BRAIN     │
│       (`docs/` Folder)       │              │    (`Notes/` or Vault Root)  │
├──────────────────────────────┤              ├──────────────────────────────┤
│ • Synchronized with git code │              │ • Brainstorming & Scratchpad │
│ • API, Database, Architecture│              │ • Research & AI Prompts      │
│ • UI Specs, Setup Guides     │              │ • Raw Ideas & Meeting Notes  │
│ • ADRs, Feature Trackers     │              │ • Personal Troubleshooting   │
│ • Maintained automatically   │              │ • Non-committed workspace    │
└──────────────────────────────┘              └──────────────────────────────┘
```

---

## 2. How Automatic Updates Work

### A. AI Agent Rule (`.agents/AGENTS.md`)
We have configured workspace rules in [.agents/AGENTS.md](file:///c:/Users/Jerry%20Cajote/Documents/Capstone%20Project/mega_pacific/.agents/AGENTS.md). 
Whenever you request any code modifications (adding APIs, altering Prisma models, modifying UI components, or fixing bugs), the AI coding assistant will **automatically update the corresponding documentation**:

- **Database Changes (`schema.prisma`)**: Updates [Database.md](../02_Architecture/Database.md), [ERD.md](../05_Database/ERD.md), and [Relationships.md](../05_Database/Relationships.md).
- **API & Route Changes (`backend/routes/`)**: Updates [API_Flow.md](../02_Architecture/API_Flow.md) and [docs/04_API/](../04_API/Authentication.md).
- **UI & Feature Additions**: Updates [Features.md](../01_Project/Features.md), [Feature_Tracker.md](../Features/Feature_Tracker.md), and UI specification files.
- **Architectural Shift**: Creates a new ADR entry (`ADR-XXX.md`).
- **Session Progress**: Appends an entry into `docs/Journal/YYYY-MM-DD.md`.

---

## 3. How to Use Obsidian as Your Second Brain

1. **Open Vault in Obsidian**:
   - Open Obsidian → Click **"Open folder as vault"** → Select `c:\Users\Jerry Cajote\Documents\Capstone Project\mega_pacific`.
2. **Browse Official Docs**:
   - Navigate the `docs/` folder in Obsidian's left sidebar.
   - Use Obsidian's **Graph View** (`Ctrl+G` / `Cmd+G`) to visually inspect links between architecture, database models, and API endpoints.
3. **Capture Personal Notes & Ideas**:
   - Create a folder named `Notes/` or `Brainstorming/` for uncommitted ideas, research, and meeting notes.
   - Because `.gitignore` and `.obsidian/` settings are configured, personal workspace files won't clutter git commits.

---

## 4. Recommended Development Workflow

```
1. Brainstorm / Research (Obsidian Second Brain)
       │
       ▼
2. Ask AI / Implement Code (Vite + Node.js + Prisma)
       │
       ▼
3. Automatic Documentation Sync (.agents/AGENTS.md triggers updates to docs/)
       │
       ▼
4. Git Commit (Code + Updated Docs merged together)
```
