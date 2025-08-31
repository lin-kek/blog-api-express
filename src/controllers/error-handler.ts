import { ErrorRequestHandler, RequestHandler } from "express";

export const requestNotFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Route does not exist." });
};

export const internalServerError: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  console.log(err);
  res.status(500).json({ error: "Internal server error. Try again later." });
};
