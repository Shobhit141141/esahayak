import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  log: [{ emit: "event", level: "error" }],
});

export default prisma;
