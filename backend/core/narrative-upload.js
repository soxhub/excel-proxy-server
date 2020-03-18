const Queue = require("bull");
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const queue = new Queue('narrative_upload', REDIS_URL);
const { setQueues } = require('bull-board');
setQueues([ queue ]);

const addNarratives = ({
	instanceUrl,
	token,
	zipPath,
}) => {
	// Remove trailing slashes and trim whitespace
	const cleanedUpInstanceUrl = instanceUrl.trim().replace(/\/+$/, "");

	queue.add({
		instanceUrl: cleanedUpInstanceUrl,
		token,
		zipPath,
	});
};

module.exports = {
	addNarratives,
	queue,
};
