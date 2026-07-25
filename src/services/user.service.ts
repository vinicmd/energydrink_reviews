import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import {
  adminUpdateUserSchema,
  createUserSchema,
  loginSchema,
  updateUserSchema,
} from "../schemas/user.schema";

type CreateUserData = z.infer<typeof createUserSchema>;
type LoginData = z.infer<typeof loginSchema>;
type UpdateUserData = z.infer<typeof updateUserSchema>;
type AdminUpdateUserData = z.infer<typeof adminUpdateUserSchema>;

export class UserService {
  async register(data: CreateUserData) {
    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      throw new Error("User already exists");
    }

    const password_hash = await bcrypt.hash(data.password, 8);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash,
        role: data.role || "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }

  async login(data: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(
      data.password,
      user.password_hash,
    );

    if (!passwordMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { role: user.role },
      process.env.JWT_SECRET as string,
      {
        subject: user.id,
        expiresIn: "1d",
      },
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async findAll() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return users;
  }

  async update(userId: string, data: UpdateUserData) {
    if (data.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (userWithEmail && userWithEmail.id !== userId) {
        throw new Error("Email already in use");
      }
    }

    let password_hash;
    if (data.password) {
      password_hash = await bcrypt.hash(data.password, 8);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(password_hash && { password_hash }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }

  async adminUpdate(userId: string, data: AdminUpdateUserData) {
    if (data.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (userWithEmail && userWithEmail.id !== userId) {
        throw new Error("Email already in use");
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }

  async delete(userId: string) {
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new Error("User not found");
    }

    await prisma.user.delete({
      where: { id: userId },
    });
  }
}
