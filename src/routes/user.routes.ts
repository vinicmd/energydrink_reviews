import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { ensureAdmin } from "../middlewares/ensureAdmin";
import { registerLimiter } from "../middlewares/rateLimiter";

export const userRoutes = Router();
const userController = new UserController();

userRoutes.post("/register", registerLimiter, userController.register);
userRoutes.post("/login", registerLimiter, userController.login);

userRoutes.put("/", ensureAuthenticated, userController.update);
userRoutes.delete("/", ensureAuthenticated, userController.delete);

userRoutes.get("/", ensureAuthenticated, ensureAdmin, userController.findAll);
userRoutes.put(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  userController.adminUpdate,
);
userRoutes.delete(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  userController.adminDelete,
);
