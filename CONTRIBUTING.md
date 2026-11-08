# Contributing Guidelines

Thank you for contributing to the Mega Pacific Capstone Project. Please follow these guidelines before submitting code changes.

---

## 1. Development Workflow

1. Fork or clone the repository.
2. Follow the [Local Development Setup](docs/03_Development/Setup.md) to set up backend and frontend environments.
3. Create a feature branch following our [Branch Strategy](docs/03_Development/Branch_Strategy.md):
   ```bash
   git checkout -b feature/my-new-feature
   ```

---

## 2. Commit Standards

- Write clear, concise commit messages following Conventional Commits format:
  `feat(module): message`, `fix(module): message`, `docs(module): message`.
- Refer to [Git Workflow & Commit Guidelines](docs/03_Development/Git_Workflow.md) for detailed examples.

---

## 3. Code Quality

- Follow the [Coding Standards & Guidelines](docs/03_Development/Coding_Standards.md).
- Keep controller logic in backend controllers, route definitions in routes, and data access in Prisma queries/repositories.
- Ensure all new features are documented in the `docs/` folder.
