import { Router } from "express";
import { userRoutes } from "./user.routes";
import { productRoutes } from "./product.routes";
import { reviewRoutes } from "./review.routes";

export const routes = Router();

routes.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

routes.use("/users", userRoutes);
routes.use("/products", productRoutes);
routes.use("/reviews", reviewRoutes);
