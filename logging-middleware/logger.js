// logger.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const LOGGING_URL = process.env.LOGGING_URL;
const TOKEN = process.env.TOKEN;

const STACKS = ["backend", "frontend"];
const LEVELS = ["debug", "info", "warn", "error", "fatal"];
const PACKAGES = {
  backend: [
    "cache",
    "controller",
    "cron_job",
    "db",
    "domain",
    "handler",
    "repository",
    "route",
    "service",
  ],
  frontend: ["api", "component", "hook", "page", "state", "style"],
  common: ["auth", "config", "middleware", "utils"],
};

function validateLogData(stack, level, pkg) {
  if (!STACKS.includes(stack))
    return "Invalid 'stack'. Must be 'backend' or 'frontend'.";
  if (!LEVELS.includes(level))
    return "Invalid 'level'. Must be one of " + LEVELS.join(", ") + ".";

  const allowedPkgs = [...PACKAGES[stack], ...PACKAGES.common];
  if (!allowedPkgs.includes(pkg)) {
    return `Invalid 'package' for ${stack} stack. Allowed: ${allowedPkgs.join(
      ", "
    )}`;
  }

  return null;
}

/**
 * Sends structured log to evaluation server
 * @param {"backend"|"frontend"} stack - Application layer
 * @param {"debug"|"info"|"warn"|"error"|"fatal"} level - Severity
 * @param {string} pkg - Module or component name
 * @param {string} message - Descriptive log message
 */
export async function Log(stack, level, pkg, message) {
  const validationError = validateLogData(stack, level, pkg);
  if (validationError) {
    console.error("Log validation failed:", validationError);
    return;
  }

  try {
    console.log(TOKEN, LOGGING_URL);
    const response = await axios.post(
      LOGGING_URL,
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      `[LOG][${level.toUpperCase()}][${stack}:${pkg}] ${message} — ${
        response.data.message
      }`
    );
  } catch (err) {
    console.error("Log transmission failed:", err.message);
  }
}
