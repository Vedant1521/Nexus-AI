import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import redis from "../shared/redis/redis.js";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import { proxyWithUser } from "./utils/proxyWithHeaders.js";
import { protect } from "./middlewares/auth.middleware.js";
import { getCurrentUser } from "./controllers/user.controller.js";
import cookieParser from "cookie-parser";
import { swaggerSpec } from "./config/swagger.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsHTML = fs.readFileSync(path.join(__dirname, "config", "docs.html"), "utf-8");
const tryHTML = fs.readFileSync(path.join(__dirname, "config", "try.html"), "utf-8");

const app = express();
const port=process.env.PORT || 5000
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
app.use(
  "/uploads",
  express.static("uploads")
);
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

app.get("/api/docs/json", (req, res) => {
  res.json(swaggerSpec);
});

app.get("/api/docs", (req, res) => {
  res.type("html").send(docsHTML);
});

app.get("/api/docs/try", (req, res) => {
  res.type("html").send(tryHTML);
});

app.use("/api/auth",proxy(process.env.AUTH_SERVICE))
app.use("/api/me",protect,getCurrentUser)
app.use("/api/chat",protect,proxyWithUser(process.env.CHAT_SERVICE))
app.use("/api/agent",protect,proxyWithUser(process.env.AGENT_SERVICE))
app.use("/api/billing",protect,proxyWithUser(process.env.BILLING_SERVICE))


app.get("/", (req, res) => {
  res.status(200).json({
    service: "gateway",
    status: "ok"
  });
});


app.listen(port, () => {
  console.log(
    `Gateway running on ${port}`
  );
});
