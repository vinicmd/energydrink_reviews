import { Request, Response } from "express";
import { UserService } from "../services/user.service.ts";
import {
  adminUpdateUserSchema,
  createUserSchema,
  loginSchema,
  updateUserSchema,
} from "../schemas/user.schema.ts";

const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response) {
    const data = createUserSchema.parse(req.body);
    const user = await userService.register(data);
    res.status(201).json(user);
  }

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    const result = await userService.login(data);
    res.json(result);
  }

  async findAll(req: Request, res: Response) {
    const users = await userService.findAll();
    res.json(users);
  }

  async update(req: Request, res: Response) {
    const userId = req.user.id;
    const data = updateUserSchema.parse(req.body);
    const user = await userService.update(userId, data);
    res.json(user);
  }

  async adminUpdate(req: Request, res: Response) {
    const { id } = req.params;
    const data = adminUpdateUserSchema.parse(req.body);
    const user = await userService.adminUpdate(id, data);
    res.json(user);
  }

  async delete(req: Request, res: Response) {
    const userId = req.user.id;
    await userService.delete(userId);
    res.status(204).send();
  }

  async adminDelete(req: Request, res: Response) {
    const { id } = req.params;
    await userService.delete(id);
    res.status(204).send();
  }
}
