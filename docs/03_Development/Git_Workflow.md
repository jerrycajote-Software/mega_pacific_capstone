# Git Workflow & Commit Guidelines

This document defines the git workflow and commit standards for the Mega Pacific repository.

---

## 1. Commit Message Format

Commit messages should follow the **Conventional Commits** format:

```
<type>(<scope>): <short summary>

[optional body]
```

### Allowed Types

| Type | Description |
|------|-------------|
| `feat` | A new feature for the user or system |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, spacing, lint fixes (no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Code performance improvements |
| `test` | Adding or updating unit/integration tests |
| `chore` | Build process, configuration, or dependency updates |

### Example Commit Messages

```bash
git commit -m "feat(auth): add single-session token validation for admin login"
git commit -m "fix(inventory): adjust stock recalculation logic on variant soft delete"
git commit -m "docs(api): update order management endpoint documentation"
git commit -m "chore(deps): update prisma client to v7.7.0"
```

---

## 2. Standard Commit Workflow

1. **Check Status**:
   ```bash
   git status
   ```

2. **Stage Changes**:
   ```bash
   git add .
   ```

3. **Commit with Meaningful Message**:
   ```bash
   git commit -m "feat(inventory): add bulk stock adjustment endpoint"
   ```

4. **Pull Latest Changes Before Pushing**:
   ```bash
   git pull origin main --rebase
   ```

5. **Push to Remote**:
   ```bash
   git push origin <branch-name>
   ```

---

## 3. Git Hygiene Rules

- **Never commit credentials**: Ensure `.env`, secret keys, or database passwords are never staged.
- **Do not commit build artifacts**: `dist/`, `node_modules/`, `generated/` must remain gitignored.
- **Keep commits atomic**: Prefer small, logical commits over massive single commits with multiple unrelated changes.
