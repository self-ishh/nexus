import express from "express";
import { createServer } from "node:http";

import { connectToSocket } from "./controllers/socketManager.js";

import mongoose from "mongoose";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

const start = async () => {
  app.set("mongo_user");
  const connectionDb = await mongoose.connect(
    "mongodb+srv://ishantsharma9134:ishi3116@cluster0.tpviqjf.mongodb.net/"
  );

  console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
  server.listen(app.get("port"), () => {
    console.log("LISTENING ON PORT 8000");
  });
};

start();
