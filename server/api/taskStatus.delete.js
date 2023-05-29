import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (!("id" in query)) {
    return { success: false };
  }

  console.log(query);
  return await prisma.taskStatus
    .delete({
      where: {
        id: Number(query.id),
      },
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
});
