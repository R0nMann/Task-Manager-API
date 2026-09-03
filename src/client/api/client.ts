import type { ApiResponse, ApiSuccess, FieldError } from '../types';

const BASE = '/api';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export class ApiError extends Error {
  status: number;
  errors?: FieldError[];

  constructor(status: number, message: string, errors?: FieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/** Shared so several concurrent 401s trigger one refresh, not one each. */
let refreshInFlight: Promise<boolean> | null = null;

export const tryRefresh = (): Promise<boolean> => {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        const body = (await res.json()) as ApiResponse<{ accessToken: string }>;

        if (!res.ok || !body.success) return false;

        accessToken = body.data.accessToken;
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
};

const request = async <T>(
  path: string,
  init: RequestInit = {},
  allowRetry = true,
): Promise<ApiSuccess<T>> => {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  // 204 No Content — DELETE routes send no body to parse.
  if (res.status === 204) {
    return { success: true, data: undefined as T };
  }

  const body = (await res.json()) as ApiResponse<T>;

  // Access token expired: refresh once, then replay the original request.
  if (res.status === 401 && allowRetry && !path.startsWith('/auth/')) {
    if (await tryRefresh()) return request<T>(path, init, false);
  }

  if (!body.success) {
    throw new ApiError(res.status, body.message, body.errors);
  }

  return body;
};

export const api = {
  get: async <T>(path: string) => (await request<T>(path)).data,

  /** Keeps the `meta` envelope for paginated endpoints. */
  getPage: <T>(path: string) => request<T>(path),

  post: async <T>(path: string, data?: unknown) =>
    (
      await request<T>(path, {
        method: 'POST',
        body: data === undefined ? undefined : JSON.stringify(data),
      })
    ).data,

  patch: async <T>(path: string, data: unknown) =>
    (await request<T>(path, { method: 'PATCH', body: JSON.stringify(data) })).data,

  del: async (path: string) => {
    await request<void>(path, { method: 'DELETE' });
  },
};
