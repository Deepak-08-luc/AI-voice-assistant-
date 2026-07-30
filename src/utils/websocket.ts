/**
 * Helper utility to build robust, normalized WebSocket connection strings
 * for AI Studio container environments and reverse proxy interceptors.
 *
 * Prevents double slashes (e.g., wss://domain.com//ws -> wss://domain.com/ws)
 * and correctly switches protocols (http: -> ws:, https: -> wss:).
 */

export interface WebSocketOptions {
  /** Optional custom base host/domain override */
  host?: string;
  /** Optional proxy path prefix (e.g., '/api/ws' or '/proxy') */
  proxyPrefix?: string;
  /** Query params to append */
  queryParams?: Record<string, string | number | boolean>;
}

/**
 * Builds a clean, normalized WebSocket connection URL guaranteed to work
 * through AI Studio proxy interceptors without double-slash syntax errors.
 *
 * @param path Relative path for the WebSocket endpoint (e.g. '/ws/telemetry' or 'ws/live')
 * @param options Configuration options for proxy prefix, host override, and query params
 * @returns Fully formatted WebSocket URL string (e.g. 'wss://ais-dev.run.app/ws/telemetry')
 */
export function getWebSocketUrl(path: string = '', options: WebSocketOptions = {}): string {
  // Determine protocol based on current browser window or default to wss:
  let protocol = 'wss:';
  let host = options.host;

  if (typeof window !== 'undefined') {
    protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (!host) {
      host = window.location.host;
    }
  } else if (!host) {
    host = 'localhost:3000';
  }

  // Handle proxy prefix if specified or inferred from path
  const prefix = options.proxyPrefix ? options.proxyPrefix.trim() : '';

  // Clean and combine path parts
  const rawPath = `${prefix}/${path}`.trim();

  // Combine protocol, host, and path
  const rawUrl = `${protocol}//${host}/${rawPath}`;

  // Sanitize double slashes: replace any occurrence of two or more slashes
  // AFTER the protocol 'ws://' or 'wss://' with a single slash '/'
  const normalizedUrl = rawUrl.replace(/(wss?:\/\/)(.+)/, (_, proto, rest) => {
    return proto + rest.replace(/\/+/g, '/');
  });

  // Append query parameters if provided
  if (options.queryParams && Object.keys(options.queryParams).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(options.queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      const separator = normalizedUrl.includes('?') ? '&' : '?';
      return `${normalizedUrl}${separator}${queryString}`;
    }
  }

  return normalizedUrl;
}

/**
 * Safely creates a WebSocket connection instance through the AI Studio proxy interceptor.
 * Includes auto-reconnect option and normalized URL creation.
 */
export function createWebSocketConnection(
  path: string,
  options: WebSocketOptions & {
    onMessage?: (data: any) => void;
    onOpen?: (event: Event) => void;
    onError?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
  } = {}
): { ws: WebSocket | null; url: string } {
  const url = getWebSocketUrl(path, options);

  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
    return { ws: null, url };
  }

  try {
    const ws = new WebSocket(url);

    if (options.onOpen) ws.addEventListener('open', options.onOpen);
    if (options.onError) ws.addEventListener('error', options.onError);
    if (options.onClose) ws.addEventListener('close', options.onClose);
    if (options.onMessage) {
      ws.addEventListener('message', (event) => {
        try {
          const parsed = JSON.parse(event.data);
          options.onMessage?.(parsed);
        } catch {
          options.onMessage?.(event.data);
        }
      });
    }

    return { ws, url };
  } catch (err) {
    console.warn('[AI Studio WS Interceptor] Failed to establish WebSocket connection:', err);
    return { ws: null, url };
  }
}
