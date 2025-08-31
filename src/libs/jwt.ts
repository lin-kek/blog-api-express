import jwt from "jsonwebtoken";

export function createJWT(payload: any) {
  return jwt.sign(payload, process.env.JWT_KEY as string);
}

export function readJWT(hash: string) {
  try {
    return jwt.verify(hash, process.env.JWT_KEY as string);
  } catch (error) {
    return false;
  }
}
