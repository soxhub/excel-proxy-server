const Queue = require("bull");
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const masterQueue = new Queue('narrative_upload', REDIS_URL);

const addNarratives = ({ companyUrl, token, zipPath }) => {
	masterQueue.add({
		companyUrl, token, zipPath
	})
};

module.exports = addNarratives;
