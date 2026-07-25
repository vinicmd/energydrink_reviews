import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

const prismaMock = mockDeep<PrismaClient>();

export const prisma = prismaMock as unknown as DeepMockProxy<PrismaClient>;
