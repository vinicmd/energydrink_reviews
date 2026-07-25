import { Router } from "express";
import { UserController } from "../controllers/user.controller.ts";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.ts";
import { ensureAdmin } from "../middlewares/ensureAdmin.ts";

export const userRoutes = Router();
const userController = new UserController();

userRoutes.post("/register", userController.register);
userRoutes.post("/login", userController.login);

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
