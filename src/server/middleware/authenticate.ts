import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import UnauthorizedError from '../errors/UnauthorizedError';

const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(new UnauthorizedError('Missing access token'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    next(err);
  }
};

export default authenticate;
