const fs = require("fs");
const path = require("path");

const WORKSPACE_ROOT = path.resolve(__dirname, "..", "..");

// Parse a file location like "backend/controllers/foo.js:42:16" into relative path, line, and column
const parseSourceFileLocation = (sourceFile) => {
  if (!sourceFile) return null;
  const cleaned = String(sourceFile).replace(/\s*\([^)]*\)\s*$/, "").trim();
  const match = cleaned.match(/^((?:backend|frontend\/src)\/[^:]+):(\d+)(?::(\d+))?$/i);
  if (!match) return null;
  return {
    relativePath: match[1].replace(/\\/g, "/"),
    line: Number(match[2]),
    column: match[3] ? Number(match[3]) : null
  };
};

// Safely read a few lines of source code around an error line inside the workspace for terminal debugging only
const readSourceCodeContext = (sourceFile, radius = 3) => {
  const parsed = parseSourceFileLocation(sourceFile);
  if (!parsed || !Number.isInteger(parsed.line) || parsed.line < 1) return null;

  try {
    const absolutePath = path.resolve(WORKSPACE_ROOT, parsed.relativePath);
    if (!absolutePath.startsWith(WORKSPACE_ROOT)) return null;
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) return null;

    const fileContent = fs.readFileSync(absolutePath, "utf8");
    const allLines = fileContent.split(/\r?\n/);
    if (parsed.line > allLines.length) return null;

    const startLine = Math.max(1, parsed.line - radius);
    const endLine = Math.min(allLines.length, parsed.line + radius);
    const lines = [];

    for (let current = startLine; current <= endLine; current += 1) {
      lines.push({
        lineNumber: current,
        content: allLines[current - 1],
        isTarget: current === parsed.line
      });
    }

    return {
      relativePath: parsed.relativePath,
      targetLine: parsed.line,
      targetColumn: parsed.column,
      lines
    };
  } catch {
    return null;
  }
};

// Match error messages, codes, and stacks against common JavaScript, Node, Express, and Prisma failure patterns
const analyzeBackendError = ({
  error = null,
  errorMessage = "",
  stackTrace = "",
  errorCode = "",
  httpStatus = null,
  route = "",
  sourceFile = null
} = {}) => {
  const rawMessage = String(error?.message || errorMessage || "").trim();
  const rawName = String(error?.name || "").trim();
  const rawCode = String(error?.code || errorCode || "").trim();
  const combined = `${rawName}: ${rawMessage}\n${String(error?.stack || stackTrace || "")}`;
  const lower = combined.toLowerCase();
  const locationSuffix = sourceFile ? ` near ${sourceFile}` : "";

  // Syntax and punctuation errors (missing colon, semicolon, brace, bracket, or invalid JSON)
  const unexpectedTokenMatch = rawMessage.match(/Unexpected token ['"`]?([^'"`\s]+)['"`]?/i);
  if (rawName === "SyntaxError" || lower.includes("syntaxerror") || unexpectedTokenMatch) {
    if (lower.includes("json") || lower.includes("unexpected end of json")) {
      return {
        category: "JSON Syntax Error",
        summary: `Invalid JSON format was received or parsed${locationSuffix}.`,
        possibleSolutions: [
          "Check the request payload or JSON string for a missing comma, missing colon (:), unquoted property key, or trailing comma.",
          "Make sure the frontend sends a valid JSON body with Content-Type: application/json.",
          "Wrap JSON.parse() calls in a try/catch block so malformed input returns HTTP 400 cleanly."
        ]
      };
    }

    if (lower.includes("missing initializer in const")) {
      return {
        category: "Syntax Error (Missing Initializer)",
        summary: `A const variable was declared without an initial value${locationSuffix}.`,
        possibleSolutions: [
          "Assign a value when declaring const (ex. const total = 0;).",
          "Change const to let if the variable will be assigned later inside an if/try block."
        ]
      };
    }

    if (lower.includes("unexpected end of input")) {
      return {
        category: "Syntax Error (Unclosed Block)",
        summary: `The file ended before a block, parenthesis, or string was closed${locationSuffix}.`,
        possibleSolutions: [
          "Check for a missing closing brace }, parenthesis ), or square bracket ] earlier in the file.",
          "Verify that all template literals (`...`) and quotes ('...' or \"...\") are properly closed."
        ]
      };
    }

    if (lower.includes("has already been declared")) {
      const dupMatch = rawMessage.match(/Identifier ['"`]?([A-Za-z0-9_$]+)['"`]? has already been declared/i);
      const varName = dupMatch ? dupMatch[1] : "this variable";
      return {
        category: "Syntax Error (Duplicate Declaration)",
        summary: `The variable or import "${varName}" was declared more than once in the same scope${locationSuffix}.`,
        possibleSolutions: [
          `Remove the duplicate const, let, or require/import declaration for "${varName}".`,
          "If you intended to update the existing value, remove const/let and reassign it (using let for the original declaration)."
        ]
      };
    }

    if (lower.includes("await is only valid in async")) {
      return {
        category: "Syntax Error (Missing async)",
        summary: `The await keyword was used inside a function that is not marked async${locationSuffix}.`,
        possibleSolutions: [
          "Add the async keyword before the enclosing function declaration (ex. const handler = async (req, res) => { ... }).",
          "If awaiting inside an array callback like .forEach(), switch to a for...of loop or Promise.all(items.map(async (...) => ...))."
        ]
      };
    }

    const tokenText = unexpectedTokenMatch ? ` "${unexpectedTokenMatch[1]}"` : "";
    return {
      category: "Syntax Error",
      summary: `JavaScript encountered an unexpected token${tokenText}${locationSuffix}.`,
      possibleSolutions: [
        "Inspect the exact reported line AND the line immediately above it for a missing colon (:), semicolon (;), comma (,), or closing brace (}).",
        "Inside object literals ({ key: value }), make sure every property has a colon (:) and properties are separated by commas (,).",
        "Check ternary expressions (condition ? a : b) for a missing colon (:) or mismatched parentheses."
      ]
    };
  }

  // ReferenceError: wrong variable name, typo, missing import, or TDZ
  const notDefinedMatch = rawMessage.match(/([A-Za-z0-9_$]+)\s+is not defined/i);
  if (notDefinedMatch) {
    const varName = notDefinedMatch[1];
    return {
      category: "Undefined Variable (ReferenceError)",
      summary: `Variable or helper "${varName}" is used${locationSuffix} without being declared or imported.`,
      possibleSolutions: [
        `Check the spelling and letter casing of "${varName}" (JavaScript is case-sensitive).`,
        `Make sure "${varName}" is declared with const/let or imported with require(...) / import at the top of the file.`,
        `If "${varName}" comes from req.body, req.params, or an object, destructure it first (ex. const { ${varName} } = req.body;).`
      ]
    };
  }

  const tdzMatch = rawMessage.match(/Cannot access ['"`]?([A-Za-z0-9_$]+)['"`]? before initialization/i);
  if (tdzMatch) {
    const varName = tdzMatch[1];
    return {
      category: "Variable Order Error (ReferenceError)",
      summary: `"${varName}" is referenced before its const/let declaration runs${locationSuffix}.`,
      possibleSolutions: [
        `Move the const/let declaration of "${varName}" above the line where it is first used.`,
        "Check for circular require()/import dependencies between two modules."
      ]
    };
  }

  if (lower.includes("assignment to constant variable")) {
    return {
      category: "Constant Reassignment Error",
      summary: `Code attempted to reassign a variable declared with const${locationSuffix}.`,
      possibleSolutions: [
        "Change const to let where the variable is declared if its value needs to be updated.",
        "Confirm you did not accidentally write = (assignment) instead of === (comparison) inside an if condition."
      ]
    };
  }

  // TypeError: missing function, null/undefined access, invalid destructuring
  const notAFunctionMatch = rawMessage.match(/([A-Za-z0-9_$.[\]'"]+)\s+is not a function/i);
  if (notAFunctionMatch) {
    const fnName = notAFunctionMatch[1];
    return {
      category: "Missing or Invalid Function (TypeError)",
      summary: `"${fnName}" was called like a function, but it is undefined or not callable${locationSuffix}.`,
      possibleSolutions: [
        `Verify that "${fnName}" is spelled correctly and exported from its module (module.exports = { ... } or export const).`,
        "Check if you imported a module object instead of destructuring the function (ex. const { fn } = require('./file')).",
        "Confirm the variable is actually a function and not null, undefined, an object, or a Promise missing await."
      ]
    };
  }

  const readPropMatch = rawMessage.match(/Cannot read properties of (undefined|null) \(reading ['"`]([^'"`]+)['"`]\)/i);
  if (readPropMatch) {
    const nullType = readPropMatch[1];
    const propName = readPropMatch[2];
    return {
      category: "Null / Undefined Property Access (TypeError)",
      summary: `Tried to read ".${propName}" from a value that was ${nullType}${locationSuffix}.`,
      possibleSolutions: [
        `Add optional chaining (?.) or a fallback default before accessing ".${propName}" (ex. record?.${propName} ?? '').`,
        "Check that the parent object exists (for example, verify a Prisma findUnique/findFirst result is not null before reading its fields).",
        "Confirm the incoming request body or query includes the expected fields and return HTTP 400 when required fields are missing."
      ]
    };
  }

  const destructureMatch = rawMessage.match(/Cannot destructure property ['"`]([^'"`]+)['"`]/i);
  if (destructureMatch) {
    const propName = destructureMatch[1];
    return {
      category: "Unsafe Destructuring (TypeError)",
      summary: `Tried to destructure "${propName}" from an undefined or null object${locationSuffix}.`,
      possibleSolutions: [
        `Provide a default empty object when destructuring (ex. const { ${propName} } = req.body || {};).`,
        "Ensure the caller sends a JSON payload and that express.json() middleware is active."
      ]
    };
  }

  if (lower.includes("is not iterable")) {
    return {
      category: "Non-Iterable Value (TypeError)",
      summary: `A loop or spread operator (...) received a value that is not an array or iterable${locationSuffix}.`,
      possibleSolutions: [
        "Guard the value with Array.isArray(items) ? items : [] before iterating or spreading.",
        "If the value comes from an async function or database call, verify you did not forget the await keyword."
      ]
    };
  }

  // Module / import resolution errors
  const missingModuleMatch = rawMessage.match(/Cannot find module ['"`]([^'"`]+)['"`]/i);
  if (missingModuleMatch || rawCode === "MODULE_NOT_FOUND" || rawCode === "ERR_MODULE_NOT_FOUND") {
    const modName = missingModuleMatch ? missingModuleMatch[1] : "the requested module";
    const isRelative = modName.startsWith(".") || modName.startsWith("/");
    return {
      category: "Missing Module / Import Error",
      summary: `Node.js could not locate "${modName}"${locationSuffix}.`,
      possibleSolutions: isRelative
        ? [
            `Double-check the relative path "${modName}" (count "../" folders carefully) and verify the file exists on disk.`,
            "Check exact filename spelling and uppercase/lowercase letter casing."
          ]
        : [
            `Verify that "${modName}" is listed in backend/package.json and installed via npm install.`,
            "Check for a typo in the package name passed to require()."
          ]
    };
  }

  // Prisma & PostgreSQL errors
  if (rawCode === "P2002") {
    const targetFields = Array.isArray(error?.meta?.target) ? error.meta.target.join(", ") : "";
    return {
      category: "Database Unique Constraint (Prisma P2002)",
      summary: `A record with the same unique value${targetFields ? ` (${targetFields})` : ""} already exists.`,
      possibleSolutions: [
        "Check for an existing record first or handle P2002 by returning HTTP 409 Conflict with a clear message.",
        "Verify that concurrent duplicate form submissions are disabled while saving."
      ]
    };
  }

  if (rawCode === "P2025") {
    return {
      category: "Database Record Not Found (Prisma P2025)",
      summary: "Attempted to update or delete a database record that no longer exists.",
      possibleSolutions: [
        "Verify the record ID exists before calling prisma.<model>.update() or delete(), and return HTTP 404 if missing.",
        "Refresh the frontend list in case another staff member already deleted or updated the record."
      ]
    };
  }

  if (rawCode === "P2003") {
    return {
      category: "Database Foreign Key Error (Prisma P2003)",
      summary: "A referenced parent record does not exist or cannot be deleted while child records still point to it.",
      possibleSolutions: [
        "Ensure all foreign key IDs (ex. userId, productId, orderId) reference valid existing rows.",
        "Before deleting a parent record, delete or unlink dependent child records inside a Prisma $transaction."
      ]
    };
  }

  if (rawCode === "P2022") {
    return {
      category: "Database Schema Mismatch (Prisma P2022)",
      summary: "Prisma queried a column that does not exist in PostgreSQL yet.",
      possibleSolutions: [
        "Compare backend/prisma/schema.prisma against your live database columns.",
        "Run prisma db push (after confirming impact) and regenerate Prisma Client with npx prisma generate."
      ]
    };
  }

  if (rawCode === "P1001" || rawCode === "P1017" || lower.includes("can't reach database server")) {
    return {
      category: "Database Connection Error",
      summary: "The backend cannot reach or lost connection to the PostgreSQL database.",
      possibleSolutions: [
        "Check DATABASE_URL in backend/.env and confirm Supabase / PostgreSQL is online.",
        "Verify your internet/firewall allows outbound connections to the database host and port."
      ]
    };
  }

  if (rawName === "PrismaClientValidationError" || lower.includes("prismaclientvalidationerror")) {
    const unknownArg = rawMessage.match(/Unknown (?:argument|field) [`'"]?([A-Za-z0-9_]+)[`'"]?/i);
    const missingArg = rawMessage.match(/Argument [`'"]?([A-Za-z0-9_]+)[`'"]? is missing/i);
    const detail = unknownArg
      ? `Prisma rejected unknown field "${unknownArg[1]}"`
      : missingArg
        ? `Prisma requires missing field "${missingArg[1]}"`
        : "A Prisma query received an invalid field name or data type";
    return {
      category: "Prisma Query Validation Error",
      summary: `${detail}${locationSuffix}.`,
      possibleSolutions: [
        "Check backend/prisma/schema.prisma to confirm the exact spelling and data type (Int, Float, String, Boolean) of each field.",
        "Convert string IDs or numbers explicitly with Number(...) before passing them into Prisma where/data objects.",
        "If you recently edited schema.prisma, run npx prisma generate and restart the backend server."
      ]
    };
  }

  // Express, Node, and Authentication errors
  if (rawCode === "ERR_HTTP_HEADERS_SENT" || lower.includes("cannot set headers after they are sent")) {
    return {
      category: "Express Double Response Error",
      summary: `A route handler attempted to send more than one HTTP response${locationSuffix}.`,
      possibleSolutions: [
        "Add the return keyword before every early response (ex. return res.status(400).json({ ... });).",
        "Make sure next() is not called after res.json() or res.send() has already run."
      ]
    };
  }

  if (rawCode === "EADDRINUSE") {
    return {
      category: "Port Already In Use",
      summary: "Another process is already listening on the backend port.",
      possibleSolutions: [
        "Stop the existing Node.js backend process running on port 5000 before starting a new one.",
        "Or set a different PORT value inside backend/.env."
      ]
    };
  }

  if (rawCode === "ECONNREFUSED" || rawCode === "ETIMEDOUT") {
    return {
      category: "Network / Upstream Connection Refused",
      summary: `The backend could not connect to an external or local service (${rawCode}).`,
      possibleSolutions: [
        "Verify the target service (database, SMTP email server, PayMongo, or storage) is running and reachable.",
        "Check hostnames, ports, and API keys in backend/.env."
      ]
    };
  }

  if (rawName === "TokenExpiredError" || rawName === "JsonWebTokenError") {
    return {
      category: "Authentication Token Error",
      summary: "The JWT access token is expired, malformed, or signed with a different secret.",
      possibleSolutions: [
        "Sign out and sign in again to obtain a fresh JWT token.",
        "Verify JWT_SECRET in backend/.env has not changed since the token was issued."
      ]
    };
  }

  if (httpStatus && httpStatus >= 500) {
    return {
      category: `Backend Server Error (HTTP ${httpStatus})`,
      summary: `Route ${route || "handler"} returned HTTP ${httpStatus}${locationSuffix}.`,
      possibleSolutions: [
        "Inspect the Code Context and Stack Trace above to pinpoint the failing statement.",
        "Verify input validation, null checks on database queries, and async/await error handling in that controller."
      ]
    };
  }

  return null;
};

module.exports = {
  parseSourceFileLocation,
  readSourceCodeContext,
  analyzeBackendError
};
