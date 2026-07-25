import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  sub: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: string;
      };
    }
  }
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "Token is missing" });
    return;
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const { sub, role } = decoded as TokenPayload;

    req.user = {
      id: sub,
      role,
    };

    return next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
}
