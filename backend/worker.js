const Queue = require('bull');
const parseZip = require('./core/parse-zip-helper');
const { parseFolder } = require('./core/narrative-create-helper');
const util = require('util');
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const MAX_JOBS_PER_WORKER = 2;
const workQueue = new Queue('narrative_upload', REDIS_URL);

workQueue.process(MAX_JOBS_PER_WORKER, async (job, done) => {
	const { instanceUrl, token, zipPath } = job.data;

	try {
		const { directory } = await parseZip(zipPath);
		await parseFolder({ token, instanceUrl, folderPath: directory });
	} catch (error) {
		util.log(error);
	} finally {
		done();
	}
});

module.exports = workQueue;
