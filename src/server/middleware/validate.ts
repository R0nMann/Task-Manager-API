import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
export interface ValidationSchemas {
    body? : ZodType,
    params? : ZodType,
    query? : ZodType
}
const validate = (schemas: ValidationSchemas): RequestHandler => {
  return (req, _res, next) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) return next(result.error);
      req.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) return next(result.error);
      req.params = result.data as typeof req.params;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) return next(result.error);
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
      });
    }
    next();
  };
};

export default validate;