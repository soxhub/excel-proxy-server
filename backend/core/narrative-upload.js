const Queue = require("bull");
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const masterQueue = new Queue('narrative_upload', REDIS_URL);

const addNarratives = ({ instanceUrl, token, zipPath }) => {
	masterQueue.add({
		instanceUrl, token, zipPath
	})
};

module.exports = addNarratives;
