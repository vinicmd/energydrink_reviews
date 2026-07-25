import request from "supertest";
import bcrypt from "bcryptjs";
import { app } from "../app";
import { prisma } from "../lib/prisma";

jest.mock("../lib/prisma");

const prismaMock = prisma as any;

describe("Users API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /users/register", () => {
    it("should create a new user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      prismaMock.user.create.mockResolvedValue({
        id: "mock-uuid",
        name: "Test User",
        email: "test@example.com",
        password_hash: "hashed_password",
        role: "USER",
        created_at: new Date(),
        updated_at: new Date(),
      });

      const response = await request(app).post("/users/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe("test@example.com");
    });

    it("should return error if email is already in use", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "existing-uuid",
      });

      const response = await request(app).post("/users/register").send({
        name: "Another User",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User already exists");
    });
  });

  describe("POST /users/login", () => {
    it("should authenticate user and return token", async () => {
      const password_hash = await bcrypt.hash("password123", 8);

      prismaMock.user.findUnique.mockResolvedValue({
        id: "mock-uuid",
        name: "Test User",
        email: "test@example.com",
        password_hash,
        role: "USER",
        created_at: new Date(),
        updated_at: new Date(),
      });

      const response = await request(app).post("/users/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should return error with invalid credentials", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app).post("/users/login").send({
        email: "wrong@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid credentials");
    });
  });
});
