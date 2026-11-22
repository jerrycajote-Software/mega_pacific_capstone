import axios from 'axios';
import { analyzeApplicationError } from './errorSolutionAdvisor';

export const ERROR_CAPTURED_EVENT = 'mega_pacific:error_captured';

let isMonitorInitialized = false;
const recentErrorTimestamps = new Map();
const DEDUPE_WINDOW_MS = 4000;

const IGNORED_API_FRAGMENTS = [
  '/api/monitoring/client-error',
  '/api/error-reports',
  '/__client-log'
];

// Create a short reference code matching the backend trace ID format
export const generateClientTraceId = (prefix = 'ERR') => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(16).slice(2, 8).toUpperCase().padEnd(6, '0');
  return `${prefix}-${datePart}-${randomPart}`;
};

// Normalize Vite dev URLs into clean workspace file paths like frontend/src/pages/admin/LoginPage.jsx:42
const normalizeProjectFrame = (rawLine) => {
  const line = String(rawLine || '').trim();
  if (!line) return null;
  if (
    line.includes('node_modules') ||
    line.includes('/.vite/deps/') ||
    line.includes('errorMonitor.js') ||
    line.includes('ErrorBoundary.jsx') ||
    line.includes('<anonymous>')
  ) {
    return null;
  }

  // Match browser stack frames pointing into /src/...
  const srcMatch = line.match(/(?:https?:\/\/[^/\s)]+)?\/?(src\/[^?\s):]+)(?:\?[^:\s)]*)?:(\d+)(?::(\d+))?/i);
  if (srcMatch) {
    const fnMatch = line.match(/^at\s+([^\s(]+)\s+\(/);
    const fnName = fnMatch ? fnMatch[1] : null;
    const cleanPath = `frontend/${srcMatch[1]}:${srcMatch[2]}${srcMatch[3] ? `:${srcMatch[3]}` : ''}`;
    return fnName ? `${cleanPath} (${fnName})` : cleanPath;
  }
  return null;
};

// Extract the exact frontend source file and call chain from stack traces and React component trees
export const extractProjectSourceFiles = ({ stackTrace = '', callerStack = '', componentStack = '' }) => {
  const combined = [callerStack, stackTrace, componentStack].filter(Boolean).join('\n');
  const seen = new Set();
  const projectFrames = [];

  for (const rawLine of combined.split('\n')) {
    const frame = normalizeProjectFrame(rawLine);
    if (frame && !seen.has(frame)) {
      seen.add(frame);
      projectFrames.push(frame);
      if (projectFrames.length >= 5) break;
    }
  }

  return {
    sourceFile: projectFrames[0] || null,
    sourceFiles: projectFrames
  };
};

// Safely read the current logged-in user profile from localStorage
export const getStoredReporterContext = () => {
  try {
    const rawUser = localStorage.getItem('appUser');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const role = user?.role || 'guest';
    return {
      userId: user?.id || user?.userId || null,
      reporterName: user?.name || user?.fullName || null,
      reporterEmail: user?.email || null,
      reporterRole: role
    };
  } catch {
    return {
      userId: null,
      reporterName: null,
      reporterEmail: null,
      reporterRole: 'guest'
    };
  }
};

// Infer the active portal name from the browser URL or logged-in user role
export const detectActivePortal = (pathname = '', role = 'guest') => {
  const path = String(pathname || window.location.pathname || '').toLowerCase();
  if (path.startsWith('/sales')) return 'sales';
  if (path.startsWith('/finance')) return 'finance';
  if (path.startsWith('/logistic')) return 'logistic';
  if (path.startsWith('/owner')) return 'owner';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/superadmin')) return 'superadmin';

  const normalizedRole = String(role || '').toLowerCase();
  if (['customer', 'sales', 'finance', 'logistic', 'owner', 'admin', 'superadmin'].includes(normalizedRole)) {
    return normalizedRole;
  }
  return 'customer';
};

export const collectBrowserInfo = () => {
  if (typeof window === 'undefined') return 'unknown';
  const viewport = `${window.innerWidth}x${window.innerHeight}`;
  const onlineState = typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'online';
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  return `${ua} | Viewport: ${viewport} | Network: ${onlineState}`;
};

const isDuplicateRecentError = (signature) => {
  const now = Date.now();
  const previousTime = recentErrorTimestamps.get(signature);
  if (previousTime && now - previousTime < DEDUPE_WINDOW_MS) {
    return true;
  }
  recentErrorTimestamps.set(signature, now);

  if (recentErrorTimestamps.size > 100) {
    for (const [key, timestamp] of recentErrorTimestamps.entries()) {
      if (now - timestamp > DEDUPE_WINDOW_MS) {
        recentErrorTimestamps.delete(key);
      }
    }
  }
  return false;
};

// Forward the captured error to both the Vite frontend terminal (dev) and Express backend terminal
const sendTraceToTerminals = (record) => {
  const payload = JSON.stringify(record);

  if (import.meta.env.DEV) {
    fetch('/__client-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true
    }).catch(() => {});
  }

  const API_URL = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('appToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token && token !== 'null' && token !== 'undefined') {
    headers.Authorization = `Bearer ${token}`;
  }

  fetch(`${API_URL}/api/monitoring/client-error`, {
    method: 'POST',
    headers,
    body: payload,
    keepalive: true
  }).catch(() => {});
};

// Print a structured error trace in the browser DevTools console and forward to both terminals
export const captureFrontendError = ({
  source = 'frontend_runtime',
  errorMessage = 'Unexpected application error',
  stackTrace = null,
  callerStack = null,
  componentStack = null,
  apiEndpoint = null,
  httpStatus = null,
  traceId = null,
  notifyUser = true
}) => {
  const reporter = getStoredReporterContext();
  const pageUrl = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/';
  const portal = detectActivePortal(pageUrl, reporter.reporterRole);
  const resolvedTraceId = traceId || generateClientTraceId('ERR');
  const cleanMessage = String(errorMessage || 'Unexpected application error').slice(0, 1000);

  const { sourceFile, sourceFiles } = extractProjectSourceFiles({
    stackTrace,
    callerStack,
    componentStack
  });

  const diagnosis = analyzeApplicationError({
    source,
    errorMessage: cleanMessage,
    stackTrace,
    componentStack,
    apiEndpoint,
    httpStatus,
    sourceFile
  });
  const diagnosisCategory = diagnosis?.category || null;
  const diagnosisHint = diagnosis?.summary || null;
  const possibleSolutions = Array.isArray(diagnosis?.possibleSolutions) ? diagnosis.possibleSolutions : [];

  // Prepend project caller frames to the stored stack trace so Admin and terminal logs show exact source files
  const mergedStackParts = [];
  if (sourceFiles.length > 0) {
    mergedStackParts.push(`Project Source:\n  at ${sourceFiles.join('\n  at ')}`);
  }
  if (stackTrace) {
    mergedStackParts.push(String(stackTrace));
  }
  const combinedStackTrace = mergedStackParts.length > 0 ? mergedStackParts.join('\n\n').slice(0, 8000) : null;

  const signature = `${source}|${pageUrl}|${apiEndpoint || ''}|${httpStatus || ''}|${cleanMessage}`;
  if (isDuplicateRecentError(signature)) {
    return {
      traceId: resolvedTraceId,
      portal,
      pageUrl,
      source,
      sourceFile,
      sourceFiles,
      diagnosisCategory,
      diagnosisHint,
      possibleSolutions,
      errorMessage: cleanMessage,
      stackTrace: combinedStackTrace,
      componentStack,
      apiEndpoint,
      httpStatus,
      ...reporter
    };
  }

  const record = {
    traceId: resolvedTraceId,
    source,
    portal,
    pageUrl,
    apiEndpoint,
    httpStatus,
    sourceFile,
    sourceFiles,
    diagnosisCategory,
    diagnosisHint,
    possibleSolutions,
    errorMessage: cleanMessage,
    stackTrace: combinedStackTrace,
    componentStack: componentStack ? String(componentStack).slice(0, 4000) : null,
    browserInfo: collectBrowserInfo(),
    capturedAt: new Date().toISOString(),
    ...reporter
  };

  console.groupCollapsed(
    `%c[ERROR TRACE ${record.traceId}]%c ${record.source}${record.sourceFile ? ` @ ${record.sourceFile}` : ''} — ${record.errorMessage}`,
    'background:#b91c1c;color:#fff;padding:2px 6px;border-radius:4px;font-weight:bold;',
    'color:#dc2626;font-weight:600;'
  );
  if (record.sourceFile) {
    console.log('Source File:', record.sourceFile);
  }
  if (record.sourceFiles.length > 1) {
    console.log('Call Chain:', record.sourceFiles.slice(1).join(' <- '));
  }
  console.log('Portal & Role:', `${record.portal} (${record.reporterRole})`);
  console.log('Page URL:', record.pageUrl);
  if (record.apiEndpoint) {
    console.log('Failed API:', `${record.apiEndpoint}${record.httpStatus ? ` (HTTP ${record.httpStatus})` : ''}`);
  }
  if (record.diagnosisCategory) {
    console.log('Category:', record.diagnosisCategory);
  }
  if (record.diagnosisHint) {
    console.log('Likely Cause:', record.diagnosisHint);
  }
  if (record.possibleSolutions.length > 0) {
    console.log(
      'Possible Solutions:\n' +
        record.possibleSolutions.map((step, idx) => `  ${idx + 1}. ${step}`).join('\n')
    );
  }
  if (record.stackTrace) {
    console.log('Stack Trace:\n', record.stackTrace);
  }
  if (record.componentStack) {
    console.log('React Component Tree:\n', record.componentStack);
  }
  console.groupEnd();

  sendTraceToTerminals(record);

  if (notifyUser && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ERROR_CAPTURED_EVENT, { detail: record }));
  }

  return record;
};

// Capture React ErrorBoundary crashes without triggering a duplicate floating toast
export const captureReactCrash = (error, errorInfo) => {
  return captureFrontendError({
    source: 'frontend_crash',
    errorMessage: error?.message || String(error || 'React render error'),
    stackTrace: error?.stack || null,
    componentStack: errorInfo?.componentStack || null,
    notifyUser: false
  });
};

// Submit a user-confirmed error report to the Admin portal via backend API
export const submitErrorReportToAdmin = async ({ errorRecord, userDescription = '' }) => {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('appToken');
  const reporter = getStoredReporterContext();
  const pageUrl = errorRecord?.pageUrl || `${window.location.pathname}${window.location.search}`;
  const portal = errorRecord?.portal || detectActivePortal(pageUrl, reporter.reporterRole);

  const headers = { 'Content-Type': 'application/json' };
  if (token && token !== 'null' && token !== 'undefined') {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/error-reports`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      traceId: errorRecord?.traceId || generateClientTraceId('ERR'),
      source: errorRecord?.source || 'user_reported',
      portal,
      reporterName: errorRecord?.reporterName || reporter.reporterName,
      reporterEmail: errorRecord?.reporterEmail || reporter.reporterEmail,
      reporterRole: errorRecord?.reporterRole || reporter.reporterRole,
      pageUrl,
      apiEndpoint: errorRecord?.apiEndpoint || null,
      httpStatus: errorRecord?.httpStatus || null,
      errorMessage: errorRecord?.errorMessage || 'User reported an unexpected problem.',
      stackTrace: errorRecord?.stackTrace || null,
      componentStack: errorRecord?.componentStack || null,
      userDescription: userDescription.trim() || null,
      browserInfo: errorRecord?.browserInfo || collectBrowserInfo()
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.success) {
    throw new Error(data?.message || 'Unable to send your error report right now. Please try again.');
  }

  return data;
};

// Attach global browser error listeners and Axios server-error tracing once on app startup
export const initializeFrontendErrorMonitor = () => {
  if (isMonitorInitialized || typeof window === 'undefined') return;
  isMonitorInitialized = true;

  window.addEventListener('error', (event) => {
    // Ignore benign browser ResizeObserver warnings that do not break functionality
    if (event?.message && String(event.message).includes('ResizeObserver loop')) {
      return;
    }

    const fallbackLocation = event?.filename
      ? `at ${event.filename}:${event.lineno || 0}:${event.colno || 0}`
      : null;

    captureFrontendError({
      source: 'frontend_runtime',
      errorMessage: event?.error?.message || event?.message || 'Unhandled script error',
      stackTrace: event?.error?.stack || fallbackLocation,
      notifyUser: true
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    // Skip Axios errors here because our Axios interceptor already traces them with full HTTP metadata
    if (reason?.isAxiosError) return;

    captureFrontendError({
      source: 'frontend_runtime',
      errorMessage: reason?.message || String(reason || 'Unhandled promise rejection'),
      stackTrace: reason?.stack || null,
      notifyUser: true
    });
  });

  // Capture synchronous caller file and line before Axios sends the asynchronous XHR request
  axios.interceptors.request.use((config) => {
    config._callerStack = new Error('Axios Request Origin').stack;
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const requestUrl = String(error?.config?.url || '');
      const shouldIgnore =
        axios.isCancel(error) ||
        error?.code === 'ERR_CANCELED' ||
        IGNORED_API_FRAGMENTS.some((fragment) => requestUrl.includes(fragment));

      if (!shouldIgnore) {
        const status = error?.response?.status || null;
        const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
        const isServerFailure = status !== null && status >= 500;
        const isUnexpectedNetworkError = status === null && !isOffline;

        if (isServerFailure || isUnexpectedNetworkError) {
          const method = String(error?.config?.method || 'GET').toUpperCase();
          const backendTraceId =
            error?.response?.headers?.['x-trace-id'] ||
            error?.response?.data?.traceId ||
            null;
          const serverMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            'Server request failed unexpectedly';

          captureFrontendError({
            source: 'api_error',
            errorMessage: serverMessage,
            stackTrace: error?.stack || null,
            callerStack: error?.config?._callerStack || null,
            apiEndpoint: `${method} ${requestUrl}`,
            httpStatus: status,
            traceId: backendTraceId,
            notifyUser: true
          });
        }
      }

      return Promise.reject(error);
    }
  );
};
