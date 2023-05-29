import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const saltRounds = 10;

export default defineEventHandler(async (event) => {
  //   const query = getQuery(event);
  //   const cookies = parseCookies(event);
  const body = await readBody(event);
  if (body == null || body == undefined) {
    return {
      error: "Body is empty",
    };
  }
  if (!("username" in body) || !("password" in body)) {
    return {
      error: "Username and password are required",
    };
  }

  const user = await prisma.users
    .findUnique({
      where: {
        username: body.username,
      },
    })
    .catch((err) => {
      console.log(err);
    });

  if (user == null || user == undefined) {
    return {
      error: "User not found",
    };
  }

  const promise = await new Promise((resolve, reject) => {
    bcrypt.compare(body.password, user.password, function (err, result) {
      resolve(result);
    });
  });

  if (promise) {
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const update = await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        token: token,
        lastLogin: new Date(),
      },
    });
    return { success: true, id: user.id, token: token };
  } else {
    return { success: false, error: "Invalid username or password" };
  }
});
