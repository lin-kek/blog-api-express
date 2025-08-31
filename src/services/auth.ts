import { User } from "@prisma/client";
import { createJWT, readJWT } from "../libs/jwt";
import { Request } from "express";
import { TokenPayload } from "../types/token-payload";
import { getUserById } from "./user";

export function createToken(user: User) {
  return createJWT({ id: user.id });
}

export async function verifyRequest(req: Request) {
  const { authorization } = req.headers;
  if (!authorization) return false;

  const [, token] = authorization.split("Bearer ");
  if (!token) return false;

  const payload = readJWT(token);
  if (!payload) return false;

  const userId = (payload as TokenPayload).id;
  const user = await getUserById(userId);
  if (!user) return false;

  return user;
}
