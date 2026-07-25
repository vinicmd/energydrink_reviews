import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      issues: err.format(),
    });
    return;
  }

  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    (err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P1001")
  ) {
    res.status(503).json({
      message: "Service unavailable. Database connection failed.",
    });
    return;
  }

  if (err instanceof Error) {
    res.status(400).json({
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    message: "Internal server error",
  });
  return;
}
