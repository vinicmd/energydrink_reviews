import { prisma } from "../lib/prisma";
import { z } from "zod";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema";

type CreateProductData = z.infer<typeof createProductSchema>;
type UpdateProductData = z.infer<typeof updateProductSchema>;

export class ProductService {
  async create(data: CreateProductData) {
    const product = await prisma.product.create({
      data,
    });
    return product;
  }

  async findAll() {
    const products = await prisma.product.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
    return products;
  }

  async findById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async update(productId: string, data: UpdateProductData) {
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data,
    });

    return product;
  }

  async delete(productId: string) {
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    await prisma.product.delete({
      where: { id: productId },
    });
  }
}
