import dbConnection from "./db/db_connect.js";
import userRouter from "./routes/user.js";
import postRouter from "./routes/post.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({limit: '10mb'}));
app.use(cors());
app.use(helmet());
app.use("/api/user/", userRouter);
app.use("/api/post/", postRouter);

dbConnection();

const port = process.env.NODE_PORT;
const server = http.createServer(app);
server.listen(port, () => { console.log(`Listening on port ${port}...`) });