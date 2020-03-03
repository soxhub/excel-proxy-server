const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const appRoot = require('app-root-path');
const s3 = require('./s3');
const config = require('config');

module.exports = async (zipPath) => {
	const isProd = process.env.NODE_ENV === 'production';
	const directory_name = path.basename(zipPath, '.zip');
	const directory = path.join(appRoot.toString(), `/zip_output/${directory_name}`);

	let zipStream;
	if (isProd) {
		zipStream = s3.getObject({
			Bucket: config.get('bucket'),
			Key: zipPath
		}).createReadStream();
	} else {
		zipStream = fs.createReadStream(zipPath);
	}

	await zipStream
		.pipe(unzipper.Extract({ path: directory }))
		.promise();

	return {
		directory
	}
}
