import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const cookies = parseCookies(event);

  if (cookies == null || cookies == undefined) {
    return { success: false };
  }
  if (!("token" in cookies)) {
    return { success: false };
  }

  const user = await prisma.users
    .findUnique({
      where: {
        token: cookies.token,
      },
    })
    .catch((err) => {
      console.log(err);
    });
  if (user == null || user == undefined) {
    return { success: false };
  }
  return { success: true, user: user };
});
