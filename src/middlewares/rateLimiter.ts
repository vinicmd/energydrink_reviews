import rateLimit from "express-rate-limit";

export const registerLimiter = rateLimit({
  windowMs: 900000,
  limit: 5,
  message: {
    message:
      "Too many accounts created from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
