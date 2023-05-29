import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (!("id" in query)) {
    return await prisma.tasks.findMany().catch((err) => {
      console.log(err);
      return err;
    });
  }
  return query;
});
