import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const body = await readBody(event);
  if (!("task" in body)) {
    return { success: false };
  }
  if (!("user" in body)) {
    return { success: false };
  }
  const update = await prisma.taskStatus.create({
    data: {
      taskId: body.task.id,
      teamId: body.user.teamId,
      photo: body.task.photo,
      status: true,
    },
  });
  console.log(update);
  return body;
});
