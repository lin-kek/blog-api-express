import { RequestHandler, Response } from "express";
import z from "zod";
import { createUser, verifyUser } from "../services/user";
import { createToken } from "../services/auth";
import { ExtendedRequest } from "../types/extended-request";

export const signup: RequestHandler = async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string(),
  });
  const data = schema.safeParse(req.body);
  if (!data.success) {
    const error = z.treeifyError(data.error);
    return res.status(400).json({ error });
  }

  const newUser = await createUser(data.data);

  if (!newUser) {
    return res.status(400).json({ error: "Failed to create new user." });
  }

  const token = createToken(newUser);

  res.status(201).json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
    token,
  });
};

export const signin: RequestHandler = async (req, res) => {
  const schema = z.object({
    email: z.email(),
    password: z.string(),
  });
  const data = schema.safeParse(req.body);
  if (!data.success) {
    const error = z.treeifyError(data.error);
    return res.status(400).json({ error });
  }

  const user = await verifyUser(data.data);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = createToken(user);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  });
};

export const validate = async (req: ExtendedRequest, res: Response) => {
  res.json({ user: req.user });
};
