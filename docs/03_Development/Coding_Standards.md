# Coding Standards & Guidelines

This document outlines the code conventions, formatting rules, and architectural standards for the Mega Pacific codebase.

---

## 1. General Principles

- **Clean Code & Self-Documentation**: Use meaningful function and variable names over excessive comments.
- **DRY (Don't Repeat Yourself)**: Extract reusable logic into utility functions, hooks, or shared middleware.
- **Fail Early**: Validate inputs at controller/validator boundaries before invoking internal services or database calls.

---

## 2. JavaScript / Node.js Standards

- **Module Syntax**:
  - Backend: Use CommonJS (`require` / `module.exports`) to remain consistent with Express server setup.
  - Frontend: Use ES Modules (`import` / `export default` or named exports).
- **Naming Conventions**:
  - `camelCase` for variables, function names, and object keys.
  - `PascalCase` for React component names, context providers, and Prisma models.
  - `UPPER_SNAKE_CASE` for environment variables and global constants.
- **Async Handling**:
  - Always use `async/await` rather than raw Promise chains `.then().catch()`.
  - Wrap backend controller operations in `try/catch` blocks or express error handling middleware.

---

## 3. Backend Architecture Standards

- **Layered Structure**:
  - `routes/`: Define endpoint URLs, HTTP verbs, and middleware bindings. Keep controller logic out of route files.
  - `controllers/`: Extract request body/params, perform authorization checks, invoke business logic, and construct HTTP responses.
  - `middleware/`: Reusable guards (e.g. `verifyToken`, `verifyAdmin`, `verifySales`).
  - `validators/`: Input sanitization and structural validation (e.g. `authValidator.js`).
  - `services/`: Asynchronous background tasks (e.g., `deliveryScheduler.js`, email transport).
- **HTTP Status Codes**:
  - `200 OK`: Successful read/update.
  - `201 Created`: Resource creation.
  - `400 Bad Request`: Validation failure or missing fields.
  - `401 Unauthorized`: Missing or invalid JWT token.
  - `403 Forbidden`: Role permission denied.
  - `404 Not Found`: Resource does not exist.
  - `500 Internal Server Error`: Unexpected runtime error (log detailed error server-side).

---

## 4. Frontend (React + Vite) Standards

- **Component Organization**:
  - Pages are located in `src/pages/{role}/`.
  - Reusable components reside in `src/components/`.
  - Context state is located in `src/context/` (`AuthContext`, `CartContext`, `ThemeContext`).
- **Styling Guidelines**:
  - Custom themes and layout variables in `src/index.css` and `src/theme.js` (MUI).
  - Use Tailwind CSS utility classes alongside Material-UI components.
  - Avoid inline element styles where CSS variables or class utilities can be applied.
- **Icon Usage**:
  - Use `lucide-react` or `@mui/icons-material`. Standardize icon sizes (e.g., `18px`, `20px`, `24px`).

---

## 5. Database & Prisma Standards

- Schema changes **must** be made in `backend/prisma/schema.prisma`.
- Run `npx prisma generate` after schema edits.
- Use explicit field mapping and relations `@relation(...)`.
- Include `createdAt` and `updatedAt` timestamps on all persistent models.
