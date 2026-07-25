import { prisma } from "../lib/prisma";
import { z } from "zod";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../schemas/review.schema";

type CreateReviewData = z.infer<typeof createReviewSchema>;
type UpdateReviewData = z.infer<typeof updateReviewSchema>;

export class ReviewService {
  async create(userId: string, data: CreateReviewData) {
    const productExists = await prisma.product.findUnique({
      where: { id: data.product_id },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    const reviewAlreadyExists = await prisma.review.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: data.product_id,
        },
      },
    });

    if (reviewAlreadyExists) {
      throw new Error("User already reviewed this product");
    }

    const review = await prisma.review.create({
      data: {
        user_id: userId,
        product_id: data.product_id,
        rating: data.rating,
        comment: data.comment,
      },
    });

    return review;
  }

  async findByProductId(productId: string) {
    const reviews = await prisma.review.findMany({
      where: { product_id: productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        history: {
          orderBy: { changed_at: "desc" },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return reviews;
  }

  async update(userId: string, reviewId: string, data: UpdateReviewData) {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      throw new Error("Review not found");
    }

    if (existingReview.user_id !== userId) {
      throw new Error("You can only update your own reviews");
    }

    const [_, updatedReview] = await prisma.$transaction([
      prisma.reviewHistory.create({
        data: {
          review_id: existingReview.id,
          old_rating: existingReview.rating,
          old_comment: existingReview.comment,
        },
      }),
      prisma.review.update({
        where: { id: reviewId },
        data: {
          ...(data.rating && { rating: data.rating }),
          ...(data.comment !== undefined && { comment: data.comment }),
        },
      }),
    ]);

    return updatedReview;
  }

  async delete(userId: string, reviewId: string) {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      throw new Error("Review not found");
    }

    if (existingReview.user_id !== userId) {
      throw new Error("You can only delete your own reviews");
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });
  }
}
