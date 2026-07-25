import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../app.ts";
import { prisma } from "../lib/prisma.ts";

jest.mock("../lib/prisma");

const prismaMock = prisma as any;

const generateToken = (userId: string) => {
  return jwt.sign({ role: "USER" }, process.env.JWT_SECRET as string, {
    subject: userId,
    expiresIn: "1d",
  });
};

describe("Reviews API", () => {
  // Substitua as strings antigas por UUIDs válidos
  const userId = "123e4567-e89b-12d3-a456-426614174001";
  const otherUserId = "123e4567-e89b-12d3-a456-426614174002";
  const productId = "123e4567-e89b-12d3-a456-426614174003";
  const reviewId = "123e4567-e89b-12d3-a456-426614174004";

  const userToken = generateToken(userId);
  const otherUserToken = generateToken(otherUserId);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /reviews", () => {
    it("should create a new review", async () => {
      prismaMock.product.findUnique.mockResolvedValue({ id: productId });
      prismaMock.review.findUnique.mockResolvedValue(null);

      prismaMock.review.create.mockResolvedValue({
        id: reviewId,
        user_id: userId,
        product_id: productId,
        rating: 8,
        comment: "Great product!",
        created_at: new Date(),
        updated_at: new Date(),
      });

      const response = await request(app)
        .post("/reviews")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          product_id: productId,
          rating: 8,
          comment: "Great product!",
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(reviewId);
      expect(response.body.rating).toBe(8);
    });

    it("should return error if user already reviewed the product", async () => {
      prismaMock.product.findUnique.mockResolvedValue({ id: productId });
      prismaMock.review.findUnique.mockResolvedValue({ id: reviewId });

      const response = await request(app)
        .post("/reviews")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          product_id: productId,
          rating: 10,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User already reviewed this product");
    });

    it("should return error if rating is invalid (e.g. > 10)", async () => {
      const response = await request(app)
        .post("/reviews")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          product_id: productId,
          rating: 11,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
    });
  });

  describe("GET /reviews/product/:productId", () => {
    it("should list all reviews for a product", async () => {
      prismaMock.review.findMany.mockResolvedValue([
        {
          id: reviewId,
          rating: 8,
          comment: "Great product!",
          user: { id: userId, name: "Test User" },
          history: [],
        },
      ]);

      const response = await request(app).get(`/reviews/product/${productId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body[0].rating).toBe(8);
    });
  });

  describe("PUT /reviews/:id", () => {
    it("should update review and create history record", async () => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: reviewId,
        user_id: userId,
        rating: 8,
        comment: "Great product!",
      });

      const updatedReview = {
        id: reviewId,
        user_id: userId,
        product_id: productId,
        rating: 5,
        comment: "Changed my mind",
        created_at: new Date(),
        updated_at: new Date(),
      };

      prismaMock.$transaction.mockResolvedValue([
        { id: "history-123" },
        updatedReview,
      ]);

      const response = await request(app)
        .put(`/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ rating: 5, comment: "Changed my mind" });

      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(5);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it("should return error if user tries to update another users review", async () => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: reviewId,
        user_id: userId,
        rating: 8,
      });

      const response = await request(app)
        .put(`/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send({ rating: 2 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "You can only update your own reviews",
      );
    });
  });

  describe("DELETE /reviews/:id", () => {
    it("should delete a review if owned by the user", async () => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: reviewId,
        user_id: userId,
      });

      prismaMock.review.delete.mockResolvedValue({ id: reviewId });

      const response = await request(app)
        .delete(`/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(204);
    });

    it("should return error if trying to delete another users review", async () => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: reviewId,
        user_id: userId,
      });

      const response = await request(app)
        .delete(`/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "You can only delete your own reviews",
      );
    });
  });
});
