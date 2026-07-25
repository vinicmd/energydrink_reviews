import { Router } from "express";
import { ProductController } from "../controllers/product.controller.ts";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.ts";
import { ensureAdmin } from "../middlewares/ensureAdmin.ts";

export const productRoutes = Router();
const productController = new ProductController();

productRoutes.get("/", productController.findAll);
productRoutes.get("/:id", productController.findById);

productRoutes.post(
  "/",
  ensureAuthenticated,
  ensureAdmin,
  productController.create,
);
productRoutes.put(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  productController.update,
);
productRoutes.delete(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  productController.delete,
);
