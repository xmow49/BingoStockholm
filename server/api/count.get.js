import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (!("teamId" in query)) {
    return { success: false };
  }

  const myTeam = await prisma.taskStatus
    .count({
      where: {
        teamId: Number(query.teamId),
        status: true,
      },
    })
    .catch((err) => {
      console.log(err);
    });

  const allTeam = await prisma.taskStatus
    .count({
      where: {
        status: true,
      },
    })
    .catch((err) => {
      console.log(err);
    });

  return { success: true, myTeam: myTeam, allTeam: allTeam };
});
