import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const LOGGING_URL = "http://20.244.56.144/evaluation-service/logs";
const TOKEN = process.env.ACCESS_TOKEN;


const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_PACKAGES = {
	backend: [
		"cache", "controller", "cron_job", "db",
		"domain", "handler", "repository", "route", "service",
	],
	frontend: [
		"api", "component", "hook", "page", "state", "style",
	],
	common: ["auth", "config", "middleware", "utils"],
};

function isValidPackage(stack, pkg) {
	return VALID_PACKAGES.common.includes(pkg) || VALID_PACKAGES[stack]?.includes(pkg);
}


export async function Log(stack, level, pkg, message) {

	if (!VALID_STACKS.includes(stack)) {
		console.error(`[Logger] Invalid stack "${stack}". Must be one of ${VALID_STACKS.join(", ")}`);
		return;
	}

	if (!VALID_LEVELS.includes(level)) {
		console.error(`[Logger] Invalid level "${level}". Must be one of ${VALID_LEVELS.join(", ")}`);
		return;
	}

	if (!isValidPackage(stack, pkg)) {
		console.error(`[Logger] Invalid package "${pkg}" for stack "${stack}".`);
		return;
	}


	const logPayload = {
		stack,
		level,
		package: pkg,
		message,
	};


	try {
		console.log(`[Logger] Sending log: ${stack}/${pkg}/${level} - ${message}`);
		const response = await axios.post(LOGGING_URL, logPayload, {
			headers: {
				Authorization: `Bearer ${TOKEN}`,
				"Content-Type": "application/json",
			},
		});
		console.log(`[Logger] ${response.data.message} (Log ID: ${response.data.logID})`);
	} catch (error) {
		if (error.response?.status === 401) {
			console.error(`[Logger] Authentication failed - Token may be expired. Please update ACCESS_TOKEN in .env file`);
		} else {
			console.error(`[Logger] Failed to send log: ${error.message}`);
		}
		// Log locally as fallback
		console.log(`[Logger Fallback] ${new Date().toISOString()} - ${stack}/${pkg}/${level}: ${message}`);
	}
}

