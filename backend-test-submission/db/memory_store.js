// Store structure: { shortcode: { url, expiry } }
export const urlStore = {};

// Helper function to check if URL has expired
export const isExpired = (shortcode) => {
	const entry = urlStore[shortcode];
	if (!entry) return true;
	return new Date() > new Date(entry.expiry);
};

// Helper function to clean expired URLs
export const cleanExpiredUrls = () => {
	const now = new Date();
	Object.keys(urlStore).forEach(shortcode => {
		if (new Date(urlStore[shortcode].expiry) < now) {
			delete urlStore[shortcode];
		}
	});
};
