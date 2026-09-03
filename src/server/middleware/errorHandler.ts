import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import AppError from "../errors/AppError";
import { env } from "../config/env";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors: err.issues.map((i)=>({
            field: i.path.join("."),
            message: i.message
        })),
    })
  }
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code==='P2025') {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    if (err.code==='P2002') {
      return res.status(409).json({ success: false, message: 'Resource already exists' });
    }
    if (err.code==='P2003') {
      return res.status(400).json({ success: false, message: 'Referenced resource does not exist' });
    }
  }
  console.error(err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development' && {
      stack: err instanceof Error ? err.stack : String(err),
    }),
  });
};
export default errorHandler;