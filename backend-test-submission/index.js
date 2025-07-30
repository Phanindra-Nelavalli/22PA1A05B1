import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Log } from "./../logging-middleware/logger.js";
import router from "./routes/routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", router);

app.listen(5000, () => {
  Log("backend", "info", "config", "Server running on port 5000");
});
