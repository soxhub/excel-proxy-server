const parseZip = require('./core/parse-zip-helper');
const { parseFolder } = require('./core/narrative-create-helper');
const { queue } = require('./core/narrative-upload');

const util = require('util');
const MAX_JOBS_PER_WORKER = 2;

queue.process(MAX_JOBS_PER_WORKER, async (job, done) => {
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
