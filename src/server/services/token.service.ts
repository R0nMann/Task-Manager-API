import crypto from 'node:crypto';
import { prisma } from '../config/prisma';
import type { Prisma } from '../../../prisma/generated/client.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getTokenExpiry,
} from '../utils/jwt';
import UnauthorizedError from '../errors/UnauthorizedError';

type DbClient = Prisma.TransactionClient | typeof prisma;

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

export const issueTokenPair = async (
  user: { id: string; email: string },
  db: DbClient = prisma,
) => {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, jti: crypto.randomUUID() });

  await db.refreshToken.create({
    data: {
      hashedToken: hashToken(refreshToken),
      userId: user.id,
      expiresAt: getTokenExpiry(refreshToken),
    },
  });

  return { accessToken, refreshToken };
};

export const revokeAllForUser = async (userId: string) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
};

export const revokeRefreshToken = async (token: string) => {
  await prisma.refreshToken.updateMany({
    where: { hashedToken: hashToken(token), revoked: false },
    data: { revoked: true },
  });
};

export const rotateRefreshToken = async (presentedToken: string) => {
  const payload = verifyRefreshToken(presentedToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { hashedToken: hashToken(presentedToken) },
  });

  if (!stored) throw new UnauthorizedError('Refresh token not recognised');

  // Reuse detection: a already-revoked token being presented means it leaked.
  if (stored.revoked) {
    await revokeAllForUser(stored.userId);
    throw new UnauthorizedError('Refresh token reuse detected — all sessions revoked');
  }

  if (stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token expired');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new UnauthorizedError('User no longer exists');

  return prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return issueTokenPair({ id: user.id, email: user.email }, tx);
  });
};
