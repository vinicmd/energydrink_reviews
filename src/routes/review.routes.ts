import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const reviewRoutes = Router();
const reviewController = new ReviewController();

reviewRoutes.get("/product/:productId", reviewController.findByProduct);

reviewRoutes.post("/", ensureAuthenticated, reviewController.create);
reviewRoutes.put("/:id", ensureAuthenticated, reviewController.update);
reviewRoutes.delete("/:id", ensureAuthenticated, reviewController.delete);
