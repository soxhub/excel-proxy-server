const Queue = require("bull");
const got = require("got");
const path = require('path');
const parseZip = require('./core/parse-zip-helper');
const narrativeCreateHelper = require('./core/narrative-create-helper');

const { parse:parseFolder } = narrativeCreateHelper;
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const MAX_JOBS_PER_WORKER = 2;

const workQueue = new Queue('narrative_upload', REDIS_URL);

workQueue.process(MAX_JOBS_PER_WORKER, async (job) => {
	let { instanceUrl, token, zipPath } = job.data;

	try {
		console.log(job.data);

		let { directory } = await parseZip(zipPath);

		console.log('directory: ', directory);

		parseFolder({ token, instanceUrl, folderPath: directory });
	} catch (error) {
		console.log(error);
	}

	return {};
});
