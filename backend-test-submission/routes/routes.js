import express from "express";
import { createShortURL, redirectToURL } from "../controllers/controller.js";

const router = express.Router();
router.post("/shorten", createShortURL);
router.get("/:shortcode", redirectToURL);

export default router;
