import { Request, Response } from "express";
import { ReviewService } from "../services/review.service";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../schemas/review.schema";

const reviewService = new ReviewService();

export class ReviewController {
  async create(req: Request, res: Response) {
    const userId = req.user.id;
    const data = createReviewSchema.parse(req.body);
    const review = await reviewService.create(userId, data);
    res.status(201).json(review);
  }

  async findByProduct(req: Request, res: Response) {
    const { productId } = req.params;
    const reviews = await reviewService.findByProductId(productId);
    res.json(reviews);
  }

  async update(req: Request, res: Response) {
    const userId = req.user.id;
    const { id } = req.params;
    const data = updateReviewSchema.parse(req.body);
    const review = await reviewService.update(userId, id, data);
    res.json(review);
  }

  async delete(req: Request, res: Response) {
    const userId = req.user.id;
    const { id } = req.params;
    await reviewService.delete(userId, id);
    res.status(204).send();
  }
}
