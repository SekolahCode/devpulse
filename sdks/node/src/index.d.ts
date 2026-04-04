/** DevPulse Node.js SDK — TypeScript type definitions */

export interface DevPulseNodeConfig {
  /** Ingest DSN. Format: https://<host>/api/ingest/<api_key> */
  dsn: string;
  /** Deployment environment label. Default: "production" */
  environment?: string;
  /** App version / git tag for release tracking. */
  release?: string | null;
  /** Set to false to disable all capturing. Default: true */
  enabled?: boolean;
  /** HTTP request timeout in milliseconds. Default: 3000 */
  timeout?: number;
  /** Maximum number of breadcrumbs to retain. Default: 20 */
  maxBreadcrumbs?: number;
  /**
   * Set to false to disable automatic uncaughtException and
   * unhandledRejection capture. Default: true
   */
  captureUnhandled?: boolean;
  /**
   * Hook called before each event is sent. Return the (optionally modified)
   * payload to send it, or return null / false to drop it. May return a Promise.
   */
  beforeSend?: (event: EventPayload) => EventPayload | null | false | Promise<EventPayload | null | false>;
}

export interface Breadcrumb {
  timestamp?: string;
  category?: string;
  message?: string;
  level?: string;
  data?: Record<string, unknown>;
}

export interface UserContext {
  id?: string | number;
  email?: string;
  username?: string;
  [key: string]: unknown;
}

export interface StackFrame {
  function?: string | null;
  file?: string | null;
  line?: number | null;
}

export interface ExceptionInfo {
  type?: string;
  message: string;
  stacktrace?: StackFrame[];
}

export interface EventPayload {
  level: string;
  exception?: ExceptionInfo;
  message?: string;
  environment?: string;
  release?: string | null;
  user?: UserContext | null;
  breadcrumbs?: Breadcrumb[];
  context?: Record<string, unknown>;
  request?: {
    method: string;
    url: string;
    headers?: Record<string, unknown>;
  };
  timestamp?: string;
  platform?: string;
  [key: string]: unknown;
}

/** Express/Connect compatible error handler middleware type */
export type ExpressErrorHandler = (
  err: Error,
  req: unknown,
  res: unknown,
  next: (err?: unknown) => void,
) => void;

export declare class DevPulseClient {
  /** Initialise the SDK. Must be called before any capture methods. */
  init(config: DevPulseNodeConfig): void;

  /** Capture an Error or any thrown value and send it to DevPulse. */
  capture(error: unknown, extra?: Partial<EventPayload>): Promise<void>;

  /** Capture a plain message at the given severity level. */
  captureMessage(message: string, level?: string, extra?: Partial<EventPayload>): Promise<void>;

  /** Set the current user context attached to all subsequent events. */
  setUser(user: UserContext): void;

  /** Clear the current user context. */
  clearUser(): void;

  /** Manually add a breadcrumb. */
  addBreadcrumb(crumb: Partial<Breadcrumb>): void;

  /**
   * Returns an Express/Connect-compatible error handler middleware.
   * Mount it after all other middleware:
   *   app.use(DevPulse.errorHandler())
   */
  errorHandler(): ExpressErrorHandler;
}

/** The singleton DevPulse client. Call `DevPulse.init(config)` to start. */
export declare const DevPulse: DevPulseClient;
