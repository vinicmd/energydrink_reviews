import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../app";
import { prisma } from "../lib/prisma";

jest.mock("../lib/prisma");

const prismaMock = prisma as any;

const generateToken = (role: "USER" | "ADMIN") => {
  return jwt.sign({ role }, process.env.JWT_SECRET as string, {
    subject: "mock-user-id",
    expiresIn: "1d",
  });
};

describe("Products API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /products", () => {
    it("should return all products", async () => {
      prismaMock.product.findMany.mockResolvedValue([
        {
          id: "mock-uuid",
          name: "Energy Drink",
          brand: "Brand",
          flavor: "Original",
          category: "Standard",
          description: null,
          product_url: null,
          image_url: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      const response = await request(app).get("/products");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
    });
  });

  describe("GET /products/:id", () => {
    it("should return a specific product", async () => {
      prismaMock.product.findUnique.mockResolvedValue({
        id: "mock-uuid",
        name: "Energy Drink",
        brand: "Brand",
        flavor: "Original",
        category: "Standard",
        description: null,
        product_url: null,
        image_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const response = await request(app).get("/products/mock-uuid");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("mock-uuid");
    });

    it("should return error when product is not found", async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      const response = await request(app).get("/products/invalid-uuid");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Product not found");
    });
  });

  describe("POST /products", () => {
    it("should create a product if user is ADMIN", async () => {
      const adminToken = generateToken("ADMIN");
      const newProduct = {
        name: "New Energy",
        brand: "Energy Co",
        flavor: "Citrus",
        category: "Sugar Free",
      };

      prismaMock.product.create.mockResolvedValue({
        id: "mock-uuid",
        ...newProduct,
        description: null,
        product_url: null,
        image_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const response = await request(app)
        .post("/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("New Energy");
    });

    it("should return 403 if user is not ADMIN", async () => {
      const userToken = generateToken("USER");

      const response = await request(app)
        .post("/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "New Energy",
          brand: "Energy Co",
          flavor: "Citrus",
          category: "Sugar Free",
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Access denied");
    });
  });

  describe("PUT /products/:id", () => {
    it("should update a product if user is ADMIN", async () => {
      const adminToken = generateToken("ADMIN");

      prismaMock.product.findUnique.mockResolvedValue({ id: "mock-uuid" });
      prismaMock.product.update.mockResolvedValue({
        id: "mock-uuid",
        name: "Updated Energy",
        brand: "Energy Co",
        flavor: "Citrus",
        category: "Sugar Free",
        description: null,
        product_url: null,
        image_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const response = await request(app)
        .put("/products/mock-uuid")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Updated Energy" });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Updated Energy");
    });
  });

  describe("DELETE /products/:id", () => {
    it("should delete a product if user is ADMIN", async () => {
      const adminToken = generateToken("ADMIN");

      prismaMock.product.findUnique.mockResolvedValue({ id: "mock-uuid" });
      prismaMock.product.delete.mockResolvedValue({ id: "mock-uuid" });

      const response = await request(app)
        .delete("/products/mock-uuid")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });
  });
});
