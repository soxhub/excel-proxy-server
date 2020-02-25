const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const appRoot = require('app-root-path');

module.exports = async (zipPath) => {
	const directory_name = path.basename(zipPath, '.zip');
	const directory = path.join(appRoot.toString(), `/zip_output/${directory_name}`);

	await fs.createReadStream(zipPath)
		.pipe(unzipper.Extract({ path: directory }))
		.promise();

	return {
		directory
	}
}
