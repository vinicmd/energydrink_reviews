import { Request, Response } from "express";
import { ProductService } from "../services/product.service.ts";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.ts";

const productService = new ProductService();

export class ProductController {
  async create(req: Request, res: Response) {
    const data = createProductSchema.parse(req.body);
    const product = await productService.create(data);
    res.status(201).json(product);
  }

  async findAll(req: Request, res: Response) {
    const products = await productService.findAll();
    res.json(products);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const product = await productService.findById(id);
    res.json(product);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = updateProductSchema.parse(req.body);
    const product = await productService.update(id, data);
    res.json(product);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await productService.delete(id);
    res.status(204).send();
  }
}
