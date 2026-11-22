// Browser-safe diagnostic engine that classifies frontend, syntax, API, and backend errors into actionable fixes
export const analyzeApplicationError = ({
  source = 'frontend_runtime',
  errorMessage = '',
  stackTrace = '',
  componentStack = '',
  apiEndpoint = null,
  httpStatus = null,
  sourceFile = null
} = {}) => {
  const rawMessage = String(errorMessage || '').trim();
  const combined = `${rawMessage}\n${String(stackTrace || '')}\n${String(componentStack || '')}`;
  const lower = combined.toLowerCase();
  const locationText = sourceFile ? ` at ${sourceFile}` : '';

  // 1. Network and Backend Reachability errors
  if (
    (source === 'api_error' && !httpStatus && (lower.includes('network error') || lower.includes('failed to fetch') || lower.includes('err_network'))) ||
    lower.includes('err_connection_refused')
  ) {
    const endpointHint = apiEndpoint ? ` (${apiEndpoint})` : '';
    return {
      category: 'Backend Connection / Network Error',
      summary: `The frontend could not reach the backend server${endpointHint}.`,
      possibleSolutions: [
        'Confirm the backend Express server is running on port 5000 (check the backend terminal for crashes or restarts).',
        'Verify VITE_API_URL in frontend/.env matches your active backend address.',
        'Check browser DevTools Network tab for CORS blocks or verify the route method (GET/POST/PUT/PATCH/DELETE) is allowed.'
      ]
    };
  }

  if (lower.includes('econnaborted') || lower.includes('timeout of')) {
    return {
      category: 'Request Timeout Error',
      summary: `The request to ${apiEndpoint || 'the backend'} took too long and timed out.`,
      possibleSolutions: [
        'Check the backend terminal to see if a slow database query or external API call (PayMongo / email / upload) hung.',
        'Verify your database connection and internet stability, then retry the action.'
      ]
    };
  }

  // 2. Syntax and JSX Compile Errors (missing colon, semicolon, brace, unclosed JSX)
  const unexpectedTokenMatch = rawMessage.match(/Unexpected token ['"`]?([^'"`\s]+)['"`]?/i);
  const expectedCharMatch = rawMessage.match(/Expected ['"`]?([^'"`\s]+)['"`]? (?:but found|to follow|before)/i);
  if (
    lower.includes('syntaxerror') ||
    unexpectedTokenMatch ||
    expectedCharMatch ||
    lower.includes('missing semicolon') ||
    lower.includes('unterminated jsx') ||
    lower.includes('adjacent jsx elements') ||
    lower.includes('missing initializer in const') ||
    lower.includes('unexpected end of input') ||
    lower.includes('unexpected end of json')
  ) {
    if (lower.includes('json')) {
      return {
        category: 'JSON Parse / Syntax Error',
        summary: `A JSON response or string could not be parsed${locationText}.`,
        possibleSolutions: [
          'Check if the backend returned an HTML error page instead of JSON (common when a route is missing or proxy target is down).',
          'Check any JSON.parse() input or localStorage value for missing quotes, colons (:), or trailing commas.'
        ]
      };
    }

    if (lower.includes('adjacent jsx elements') || lower.includes('unterminated jsx')) {
      return {
        category: 'JSX Syntax Error',
        summary: `A React JSX element is unclosed or missing a single parent wrapper${locationText}.`,
        possibleSolutions: [
          'Wrap multiple sibling JSX elements inside a React Fragment (<> ... </>) or a single parent <div>.',
          'Check that every opening tag (ex. <Box>, <div>) has a matching closing tag and self-closing tags end with />.'
        ]
      };
    }

    if (lower.includes('missing initializer in const')) {
      return {
        category: 'Syntax Error (Missing Value)',
        summary: `A const variable was declared without assigning a value${locationText}.`,
        possibleSolutions: [
          'Give the const variable an initial value (ex. const count = 0;).',
          'Use let instead of const if the value will be assigned later.'
        ]
      };
    }

    if (lower.includes('unexpected end of input')) {
      return {
        category: 'Syntax Error (Unclosed Block)',
        summary: `The file ended with an unclosed brace, parenthesis, bracket, or string${locationText}.`,
        possibleSolutions: [
          'Check for a missing closing }, ), or ] in the file.',
          'Verify all quotes (\'...\', "...") and backticks (`...`) are closed properly.'
        ]
      };
    }

    const expectedHint = expectedCharMatch
      ? `Expected "${expectedCharMatch[1]}"`
      : unexpectedTokenMatch
        ? `Unexpected token "${unexpectedTokenMatch[1]}"`
        : 'Invalid JavaScript or JSX syntax';
    return {
      category: 'Syntax / Punctuation Error',
      summary: `${expectedHint}${locationText}.`,
      possibleSolutions: [
        'Inspect the exact line AND the line immediately above it for a missing colon (:), semicolon (;), comma (,), or closing brace (}).',
        'Inside object literals or inline style={{ ... }}, make sure every key uses a colon (:) and properties are separated by commas (,).',
        'Check ternary expressions (condition ? valueA : valueB) to confirm the colon (:) is not missing.'
      ]
    };
  }

  // 3. Wrong or Missing Variable Errors (ReferenceError)
  const notDefinedMatch = rawMessage.match(/([A-Za-z0-9_$]+)\s+is not defined/i);
  if (notDefinedMatch) {
    const varName = notDefinedMatch[1];
    return {
      category: 'Undefined Variable (ReferenceError)',
      summary: `"${varName}" is referenced${locationText} but is not declared or imported in this scope.`,
      possibleSolutions: [
        `Check the spelling and capitalization of "${varName}" on that line.`,
        `Declare "${varName}" with const/let or add the missing import statement at the top of the file.`,
        `If "${varName}" is a React component prop, make sure it is destructured in the component parameters.`
      ]
    };
  }

  const tdzMatch = rawMessage.match(/Cannot access ['"`]?([A-Za-z0-9_$]+)['"`]? before initialization/i);
  if (tdzMatch) {
    const varName = tdzMatch[1];
    return {
      category: 'Variable Order Error (ReferenceError)',
      summary: `"${varName}" was used before its const/let declaration executed${locationText}.`,
      possibleSolutions: [
        `Move the const/let declaration of "${varName}" above the line where it is referenced.`,
        'Check for circular imports between two files.'
      ]
    };
  }

  if (lower.includes('assignment to constant variable')) {
    return {
      category: 'Constant Reassignment Error',
      summary: `Attempted to reassign a const variable${locationText}.`,
      possibleSolutions: [
        'Change const to let if the variable needs to be reassigned.',
        'If updating React state, call its setter function (ex. setValue(next)) instead of reassigning the state variable directly.'
      ]
    };
  }

  // 4. Missing Function, Null/Undefined Access, and Type Errors
  const notFnMatch = rawMessage.match(/([A-Za-z0-9_$.[\]'"]+)\s+is not a function/i);
  if (notFnMatch) {
    const fnName = notFnMatch[1];
    return {
      category: 'Missing or Invalid Function (TypeError)',
      summary: `"${fnName}" was called as a function, but it is undefined or not callable${locationText}.`,
      possibleSolutions: [
        `Verify "${fnName}" is spelled correctly and exported from its source file (named export { fn } vs default export).`,
        'If this is a callback prop (ex. onSave, onClose), verify the parent component passed a function and guard with if (typeof prop === "function").',
        'Check if you called an array method (ex. .map or .filter) on an object or null value instead of an array.'
      ]
    };
  }

  const readPropMatch = rawMessage.match(/Cannot read properties of (undefined|null) \(reading ['"`]([^'"`]+)['"`]\)/i);
  if (readPropMatch) {
    const nullType = readPropMatch[1];
    const propName = readPropMatch[2];
    return {
      category: 'Null / Undefined Property Access (TypeError)',
      summary: `Tried to read ".${propName}" on a value that was ${nullType}${locationText}.`,
      possibleSolutions: [
        `Add optional chaining (?.) and a safe fallback (ex. item?.${propName} ?? '').`,
        'Check if asynchronous API data has not loaded yet and guard rendering until loading completes.',
        'Inspect the backend JSON response to confirm the property name matches what the frontend expects.'
      ]
    };
  }

  const destructureMatch = rawMessage.match(/Cannot destructure property ['"`]([^'"`]+)['"`]/i);
  if (destructureMatch) {
    const propName = destructureMatch[1];
    return {
      category: 'Unsafe Destructuring (TypeError)',
      summary: `Tried to destructure "${propName}" from an undefined or null value${locationText}.`,
      possibleSolutions: [
        `Add a fallback empty object when destructuring (ex. const { ${propName} } = data || {};).`,
        'Ensure the parent component or API response actually provides this object before rendering.'
      ]
    };
  }

  if (lower.includes('is not iterable')) {
    return {
      category: 'Non-Iterable Value (TypeError)',
      summary: `A spread (...value) or loop ran on a value that is not an array${locationText}.`,
      possibleSolutions: [
        'Use a safe array fallback (ex. Array.isArray(list) ? list : []) before iterating or spreading.',
        'Check that the API returned an array instead of null, undefined, or a plain object.'
      ]
    };
  }

  // 5. Module / Import / Export Resolution Errors
  const missingExportMatch = rawMessage.match(/does not provide an export named ['"`]([^'"`]+)['"`]/i);
  if (missingExportMatch) {
    const exportName = missingExportMatch[1];
    return {
      category: 'Import / Export Mismatch',
      summary: `Imported "${exportName}", but the target file does not export that name${locationText}.`,
      possibleSolutions: [
        `Check if "${exportName}" is a default export (import ${exportName} from '...') instead of a named export (import { ${exportName} } from '...').`,
        `Verify the exact spelling of "${exportName}" in the target file's export statement.`
      ]
    };
  }

  const resolveImportMatch = rawMessage.match(/(?:Failed to resolve import|Cannot find module) ['"`]([^'"`]+)['"`]/i);
  if (resolveImportMatch) {
    const modPath = resolveImportMatch[1];
    return {
      category: 'Missing File or Package Import',
      summary: `Could not locate imported module "${modPath}"${locationText}.`,
      possibleSolutions: [
        `Verify the relative path "${modPath}" and check for missing "../" or filename spelling/casing typos.`,
        'If this is an external npm package, confirm it is installed in package.json.'
      ]
    };
  }

  if (lower.includes('failed to fetch dynamically imported module')) {
    return {
      category: 'Stale Page Chunk / Dynamic Import Error',
      summary: 'The browser failed to load a lazy-loaded JavaScript chunk for this route.',
      possibleSolutions: [
        'Refresh the browser page (Ctrl+Shift+R) to load the latest compiled bundle.',
        'If running locally, confirm the Vite dev server is still running without build errors.'
      ]
    };
  }

  // 6. React-Specific Errors
  if (lower.includes('rendered more hooks') || lower.includes('rendered fewer hooks') || lower.includes('invalid hook call')) {
    return {
      category: 'React Rules of Hooks Violation',
      summary: `React hooks ran in an inconsistent order or outside a valid component${locationText}.`,
      possibleSolutions: [
        'Move all useState, useEffect, useMemo, and useCallback calls to the top of the component before any early return statements.',
        'Never call React hooks inside if conditions, loops, or nested click handlers.'
      ]
    };
  }

  if (lower.includes('objects are not valid as a react child')) {
    return {
      category: 'Invalid React Render Value',
      summary: `A plain JavaScript object was rendered directly inside JSX${locationText}.`,
      possibleSolutions: [
        'Render a specific string or number property (ex. {item.name}) instead of rendering the whole object ({item}).',
        'If rendering an error or date, convert it with String(err.message) or date.toLocaleString().'
      ]
    };
  }

  if (lower.includes('maximum update depth exceeded') || lower.includes('too many re-renders')) {
    return {
      category: 'React Infinite Re-Render Loop',
      summary: `A component triggered state updates endlessly during render or useEffect${locationText}.`,
      possibleSolutions: [
        'Check event handlers to make sure you pass a function reference (onClick={() => handleSave()}) instead of invoking it directly (onClick={handleSave()}).',
        'Review useEffect dependency arrays so state updated inside the effect does not re-trigger the same effect infinitely.'
      ]
    };
  }

  // 7. Database / Prisma Errors surfaced in logs
  if (lower.includes('p2002') || lower.includes('unique constraint')) {
    return {
      category: 'Database Duplicate Entry (Prisma P2002)',
      summary: 'A database write failed because a unique field value already exists.',
      possibleSolutions: [
        'Verify whether a record with the same email, code, or unique key already exists.',
        'Prevent double-click submissions on the form and handle HTTP 409 Conflict gracefully.'
      ]
    };
  }

  if (lower.includes('p2025') || lower.includes('record to update not found')) {
    return {
      category: 'Database Record Not Found (Prisma P2025)',
      summary: 'The target database record was deleted or does not exist.',
      possibleSolutions: [
        'Refresh the page to load the latest records before retrying the action.',
        'Check that the backend verifies the record exists and returns HTTP 404 before updating or deleting.'
      ]
    };
  }

  if (lower.includes('prismaclientvalidationerror')) {
    return {
      category: 'Backend Database Query Validation Error',
      summary: 'The backend sent an invalid field name or data type to Prisma.',
      possibleSolutions: [
        'Check the backend terminal trace for the exact controller file and line.',
        'Verify the payload fields and data types (ex. Number vs String) match backend/prisma/schema.prisma.'
      ]
    };
  }

  // 8. HTTP Status-based API Failures
  if (httpStatus === 401 || lower.includes('jwt expired') || lower.includes('unauthorized')) {
    return {
      category: 'Authentication / Session Error (HTTP 401)',
      summary: `The request to ${apiEndpoint || 'this endpoint'} was rejected because the user session is missing or expired.`,
      possibleSolutions: [
        'Have the user sign out and sign back in to refresh their session token.',
        'Verify the frontend attaches the Authorization: Bearer <token> header for this request.'
      ]
    };
  }

  if (httpStatus === 403) {
    return {
      category: 'Permission Denied (HTTP 403)',
      summary: `The signed-in role does not have permission to access ${apiEndpoint || 'this endpoint'}.`,
      possibleSolutions: [
        'Verify the route middleware allows the active staff role (Sales, Finance, Logistics, Admin, Owner).',
        'Confirm the account has not been suspended or deleted.'
      ]
    };
  }

  if (httpStatus === 404) {
    return {
      category: 'Endpoint or Resource Not Found (HTTP 404)',
      summary: `The requested backend URL ${apiEndpoint || ''} was not found.`,
      possibleSolutions: [
        'Check the exact API path and HTTP method (GET/POST/PUT/PATCH/DELETE) between the frontend call and backend/routes/.',
        'Confirm the route file is mounted in backend/server.js and that the requested record ID exists.'
      ]
    };
  }

  if (httpStatus === 409) {
    return {
      category: 'Data Conflict (HTTP 409)',
      summary: `The action on ${apiEndpoint || 'this resource'} conflicted with the current state in the database.`,
      possibleSolutions: [
        'Refresh the page to get the latest prices, stock levels, or order status before retrying.',
        'Review the backend conflict message to see if another user updated the same record first.'
      ]
    };
  }

  if (source === 'api_error' && httpStatus >= 500) {
    return {
      category: `Backend Server Error (HTTP ${httpStatus})`,
      summary: `The backend threw an unhandled server error while handling ${apiEndpoint || 'this request'}.`,
      possibleSolutions: [
        'Search the backend terminal using the Reference Code (Trace ID) above to see the exact backend controller file, line snippet, and fix.',
        'Inspect the request payload and database state for null values or unhandled exceptions in that backend controller.'
      ]
    };
  }

  // Safe generic fallback so Admin always gets useful next steps
  return {
    category: source === 'frontend_crash' ? 'React Page Crash' : 'Application Runtime Error',
    summary: `An unexpected error occurred${locationText}.`,
    possibleSolutions: [
      sourceFile
        ? `Open ${sourceFile} and inspect the line and surrounding variables/function calls.`
        : 'Inspect the Stack Trace below to locate the first file inside frontend/src/ or backend/.',
      'Match the Reference Code (Trace ID) in the backend and frontend terminals for full line-by-line context.'
    ]
  };
};
