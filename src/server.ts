import express from "express";
import { corsConfig } from "./libs/cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import { mainRoutes } from "./routes/main";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import {
  internalServerError,
  requestNotFound,
} from "./controllers/error-handler";

const server = express();

server.use(corsConfig);
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(helmet());
server.use(express.static("public"));

server.use("/api", mainRoutes);
server.use("/api/admin", adminRoutes);
server.use("/api/auth", authRoutes);

server.use(requestNotFound);
server.use(internalServerError);

server.listen(3000, () => {
  console.log("Server running on port 3000.");
});
