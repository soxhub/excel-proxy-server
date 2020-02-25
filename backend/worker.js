const parseZip = require('./core/parse-zip-helper');
const { parseFolder } = require('./core/narrative-create-helper');
const { queue } = require('./core/narrative-upload');

const rimraf = require('rimraf');

const util = require('util');
const MAX_JOBS_PER_WORKER = 2;

queue.process(MAX_JOBS_PER_WORKER, async (job, done) => {
	const { instanceUrl, token, zipPath } = job.data;

	try {
		const { directory } = await parseZip(zipPath);
		await parseFolder({ token, instanceUrl, folderPath: directory, job });

		// remove folder, and remove unzip content
		rimraf(zipPath, () => rimraf(directory, () => util.log('Clean up done.')));

	} catch (error) {
		util.log(error);
	} finally {
		done();
	}
});

module.exports = queue;
