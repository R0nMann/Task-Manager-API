import { api, setAccessToken, tryRefresh } from './client';
import type { User } from '../types';

interface AuthPayload {
  accessToken: string;
  user: User;
}

const USER_KEY = 'taskmanager.user';

/**
 * The profile (not the token) is cached so a page reload can restore the
 * display name. It is only ever trusted for rendering — every request is
 * still authorised by the token.
 */
const cacheUser = (user: User | null) => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* private mode / blocked storage — session just won't survive reload */
  }
};

const readCachedUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const register = (input: { email: string; password: string; name?: string }) =>
  api.post<User>('/auth/register', input);

export const login = async (input: { email: string; password: string }) => {
  const payload = await api.post<AuthPayload>('/auth/login', input);
  setAccessToken(payload.accessToken);
  cacheUser(payload.user);
  return payload.user;
};

/** Called once on app start: trades the refresh cookie for a live session. */
export const restoreSession = async (): Promise<User | null> => {
  const refreshed = await tryRefresh();
  if (!refreshed) {
    cacheUser(null);
    return null;
  }
  return readCachedUser();
};

export const logout = async () => {
  try {
    await api.post<void>('/auth/logout');
  } finally {
    setAccessToken(null);
    cacheUser(null);
  }
};
