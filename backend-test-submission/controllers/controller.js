import { Log } from "./../../logging-middleware/logger.js";
import { urlStore } from "../db/store.js";

export const createShortURL = async (req, res) => {
  const { originalUrl, customCode } = req.body;

  try {
    if (!originalUrl || !customCode) {
      await Log("backend", "warn", "handler", "Missing fields in request body");
      return res.status(400).json({ message: "URL and Custom Code required" });
    }

    if (urlStore[customCode]) {
      await Log("backend", "error", "handler", "Shortcode already exists");
      return res.status(409).json({ message: "Shortcode already in use" });
    }

    urlStore[customCode] = originalUrl;

    await Log(
      "backend",
      "info",
      "controller",
      `Shortened URL created: ${customCode}`
    );
    return res
      .status(201)
      .json({ shortUrl: `http://localhost:3000/${customCode}` });
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

export const redirectToURL = (req, res) => {
  const { shortcode } = req.params;
  const url = urlStore[shortcode];

  if (url) {
    Log("backend", "info", "handler", `Redirecting to ${url}`);
    return res.redirect(url);
  }

  Log("backend", "error", "handler", `Shortcode ${shortcode} not found`);
  return res.status(404).send("Shortcode not found");
};
