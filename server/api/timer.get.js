import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const res = await prisma.storage
    .findUnique({
      where: {
        id: "startTime",
      },
    })
    .catch((err) => {
      console.log(err);
    });

  if ("start" in query && res.value == 0) {
    console.log(Date.now());
    await prisma.storage.update({
      where: {
        id: "startTime",
      },
      data: {
        value: String(Date.now()),
      },
    });
    return { success: true };
  }
  if ("stop" in query && res.value != 0) {
    await prisma.storage.update({
      where: {
        id: "startTime",
      },
      data: {
        value: "0",
      },
    });
    return { success: true };
  }

  return { success: true, startTime: res.value };
});
