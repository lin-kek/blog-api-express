import bcrypt from "bcryptjs";
import { prisma } from "../libs/prisma";

type CreateUserProps = {
  name: string;
  email: string;
  password: string;
};

export async function createUser({ name, email, password }: CreateUserProps) {
  email = email.toLowerCase();

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (user) return false;

  const hashedPassword = bcrypt.hashSync(password);

  return await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
}

type VerifyUserProps = {
  email: string;
  password: string;
};

export async function verifyUser({ email, password }: VerifyUserProps) {
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) return false;

  if (!bcrypt.compareSync(password, user.password)) return false;

  return user;
}

export async function getUserById(id: number) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
    },
  });
}
