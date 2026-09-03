import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { issueTokenPair, revokeRefreshToken, rotateRefreshToken } from './token.service';
import AppError from '../errors/AppError';
import UnauthorizedError from '../errors/UnauthorizedError';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';

// Hashed once at startup. Compared against when the email is unknown so that a
// failed login costs roughly the same time as a successful one — without this,
// response timing tells an attacker which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('no-user-with-this-email', env.BCRYPT_SALT_ROUNDS);

export const register = async ({ email, password, name }: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) throw new AppError(409, 'Email already registered');

  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  return prisma.user.create({
    data: { email, password: hashedPassword, name },
    select: { id: true, email: true, name: true },
  });
};

export const login = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email } });

  const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

  // One message for both failures — never reveal which half was wrong.
  if (!user || !passwordMatches) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const { accessToken, refreshToken } = await issueTokenPair(user);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name },
  };
};

export const refresh = async (presentedToken: string | undefined) => {
  if (!presentedToken) throw new UnauthorizedError('Refresh token missing');

  // Verifies signature, checks the DB record, detects reuse, revokes the old
  // token and issues a fresh pair — all inside one transaction.
  return rotateRefreshToken(presentedToken);
};

export const logout = async (presentedToken: string | undefined) => {
  // Logging out without a cookie is not an error — the client ends up logged out either way.
  if (presentedToken) await revokeRefreshToken(presentedToken);
};
