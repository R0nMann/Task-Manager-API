import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

const { JsonWebTokenError, TokenExpiredError } = jwt;
import { env } from '../config/env';
import UnauthorizedError from '../errors/UnauthorizedError';

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

const accessExpiry = env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'];
const refreshExpiry = env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'];

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: accessExpiry });

export const signRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: refreshExpiry });

const verify = <T>(token: string, secret: string, label: string): T => {
  try {
    return jwt.verify(token, secret) as T;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new UnauthorizedError(`${label} token expired`);
    }
    if (err instanceof JsonWebTokenError) {
      throw new UnauthorizedError(`Invalid ${label} token`);
    }
    throw err;
  }
};

export const verifyAccessToken = (token: string) =>
  verify<AccessTokenPayload>(token, env.JWT_ACCESS_SECRET, 'access');

export const verifyRefreshToken = (token: string) =>
  verify<RefreshTokenPayload>(token, env.JWT_REFRESH_SECRET, 'refresh');

export const getTokenExpiry = (token: string): Date => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) throw new Error('Token is missing an exp claim');
  return new Date(decoded.exp * 1000);
};