import type { CookieOptions, Request, RequestHandler, Response } from 'express';
import * as authService from '../services/auth.service';
import { getTokenExpiry } from '../utils/jwt';
import { env } from '../config/env';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';

export const REFRESH_COOKIE = 'refreshToken';

// `path` must match the mount point of auth.routes.ts, otherwise the browser
// will not send the cookie to /refresh — or clear it on /logout.
const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
};

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    ...refreshCookieOptions,
    expires: getTokenExpiry(token), // cookie dies exactly when the JWT does
  });
};

const readRefreshCookie = (req: Request): string | undefined => req.cookies?.[REFRESH_COOKIE];

export const register: RequestHandler<unknown, unknown, RegisterInput> = async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ success: true, data: user });
};

export const login: RequestHandler<unknown, unknown, LoginInput> = async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(200).json({ success: true, data: { accessToken, user } });
};

export const refresh: RequestHandler = async (req, res) => {
  const { accessToken, refreshToken } = await authService.refresh(readRefreshCookie(req));
  setRefreshCookie(res, refreshToken);
  res.status(200).json({ success: true, data: { accessToken } });
};

export const logout: RequestHandler = async (req, res) => {
  await authService.logout(readRefreshCookie(req));
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
  res.status(200).json({ success: true, message: 'Logged out' });
};
