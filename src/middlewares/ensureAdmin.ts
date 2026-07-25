import { NextFunction, Request, Response } from "express";

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  return next();
}
