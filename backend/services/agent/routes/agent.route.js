import express from "express";
import { chat, deploy } from "../controllers/agent.controller.js";
import multer from "../config/multer.js";



const router =
express.Router();

router.post(
 "/chat",
 multer.single("file"),
 chat
);

router.post(
 "/deploy",
 deploy
);

export default router;