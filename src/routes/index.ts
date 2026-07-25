import { Router } from "express";
import { userRoutes } from "./user.routes.ts";
import { productRoutes } from "./product.routes.ts";
import { reviewRoutes } from "./review.routes.ts";

export const routes = Router();

routes.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

routes.use("/users", userRoutes);
routes.use("/products", productRoutes);
routes.use("/reviews", reviewRoutes);
