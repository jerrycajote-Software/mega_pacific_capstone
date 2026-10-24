# Branching Strategy

This document outlines the branching strategy used for managing feature development and release pipelines in the Mega Pacific project.

---

## 1. Branch Hierarchy

```
main (Production Ready)
  └── dev (Integration Branch)
        ├── feature/auth-otp-verification
        ├── feature/stock-management-grid
        ├── fix/login-session-expiry
        └── docs/restructure-docs-folder
```

---

## 2. Branch Types & Naming Conventions

| Branch Type | Pattern | Description |
|-------------|---------|-------------|
| **Main** | `main` | Production branch. Code here must always be stable and deployable. |
| **Development** | `dev` | Active development integration branch. |
| **Feature** | `feature/<feature-name>` | New features or enhancements (e.g. `feature/order-export-pdf`). |
| **Bug Fix** | `fix/<bug-name>` | Fixes for issues identified during testing or development. |
| **Hotfix** | `hotfix/<critical-issue>` | Urgent production bug fixes branched directly off `main`. |
| **Documentation** | `docs/<doc-scope>` | Documentation updates or structural rewrites. |

---

## 3. Pull Request & Merging Process

1. Create a feature branch off `dev`.
2. Implement and test changes locally.
3. Push feature branch to GitHub/GitLab.
4. Create a Pull Request (PR) into `dev`.
5. Perform code review & verification.
6. Merge using **Squash & Merge** or **Rebase & Merge** to maintain a clean history.
7. Merge `dev` into `main` for release deployment.
