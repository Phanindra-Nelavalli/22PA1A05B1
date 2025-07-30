import { Log } from "./../../logging-middleware/logger.js";
import { urlStore, isExpired, cleanExpiredUrls } from "../db/memory_store.js";

export const createShortURL = async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  try {
    // Clean expired URLs first
    cleanExpiredUrls();

    if (!url || !shortcode) {
      await Log("backend", "warn", "handler", "Missing fields in request body");
      return res
        .status(400)
        .json({ message: "URL and shortcode are required" });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      await Log("backend", "warn", "handler", `Invalid URL format: ${url}`);
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // Check if shortcode already exists and is not expired
    if (urlStore[shortcode] && !isExpired(shortcode)) {
      await Log(
        "backend",
        "error",
        "handler",
        `Shortcode "${shortcode}" already exists`
      );
      return res.status(409).json({ message: "Shortcode already in use" });
    }

    // Calculate expiry time (validity in minutes)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + validity);

    // Store URL with expiry
    urlStore[shortcode] = {
      url: url,
      expiry: expiryTime.toISOString(),
    };

    await Log(
      "backend",
      "info",
      "controller",
      `Shortened URL created: ${shortcode} (expires: ${expiryTime.toISOString()})`
    );

    return res.status(201).json({
      shortLink: `http://localhost:5000/api/${shortcode}`,
      expiry: expiryTime.toISOString(),
    });
  } catch (error) {
    await Log(
      "backend",
      "fatal",
      "controller",
      `Unexpected error: ${error.message}`
    );
    return res.status(500).json({ message: "Server error" });
  }
};

export const redirectToURL = async (req, res) => {
  const { shortcode } = req.params;

  // Clean expired URLs first
  cleanExpiredUrls();

  const entry = urlStore[shortcode];

  if (!entry) {
    await Log(
      "backend",
      "error",
      "handler",
      `Shortcode "${shortcode}" not found`
    );
    return res.status(404).send("Shortcode not found");
  }

  if (isExpired(shortcode)) {
    // Remove expired entry
    delete urlStore[shortcode];
    await Log(
      "backend",
      "warn",
      "handler",
      `Shortcode "${shortcode}" has expired`
    );
    return res.status(410).send("Shortcode has expired");
  }

  await Log("backend", "info", "handler", `Redirecting to: ${entry.url}`);
  return res.redirect(entry.url);
};
