const got = require("got");
const xml2js = require('xml2js');
const uploadImageHelper  = require("./upload-image-helper");
const path = require('path');
const fs = require('fs');
const uid = require('uid');
const util = require('util');
const glob = require('glob');

/**
 * Find HTML Files
 */
const _findHtmlFiles = async (folderPath) => {
	return await new Promise((resolve, reject) => {
		glob(`${folderPath}/**/*.{html,htm}`, function (er, matches) {
			if (er) reject(er);
			const files = matches.map((match) => ({
				path: match,
				basename: path.basename(match),
				dirname: path.dirname(match),
				filename: path.parse(path.basename(match)).name,
			}));
			resolve(files);
		});
	});
} // _findHtmlFiles

/**
 * Find Image Files
 */
const _findImageFiles = async (file) => {
	const { dirname, filename } = file;
	let imagesArray = [];
	let imagesFolderPath = '';

	const isImagesFolderExist = ({ dirname, filename, ext}) => {
		return fs.existsSync(path.join(dirname, filename + ext));
	}

	// The images are in a folder that lives at the same level as the HTML file. The folder contains  a `_files` affix or the `.fld` extension
	if (isImagesFolderExist({dirname, filename, ext: '_files'})) {
		imagesFolderPath = path.join(dirname, filename + '_files');
	} else if (isImagesFolderExist({dirname, filename, ext: '.fld'})) {
		imagesFolderPath = path.join(dirname, filename + '.fld');
	}

	if (imagesFolderPath && fs.statSync(imagesFolderPath).isDirectory()) {
		imagesArray = await new Promise((resolve, reject) => {
			glob(`${imagesFolderPath}/*.{jpg,png}`, function (er, matches) {
				if (er) reject(er);
				const files = matches.map((match) => {
					const mimetype = path.extname(match);
					return {
						baseFolder: path.basename(path.dirname(match)),
						filename: path.basename(match),
						mimetype: mimetype === '.png' ? 'image/png' : 'image/jpeg',
						path: match,
					}
				});
				resolve(files);
			});
		});
	}

	return imagesArray;
}; // _findImageFiles

/**
 * Parse Folder
 */
const parseFolder = async ({
	folderPath,
	instanceUrl,
	token,
	job,
}) => {
	// Find array of HTML files
	const htmlFiles = await _findHtmlFiles(folderPath);
	util.log("Files are: ", htmlFiles);

	// Create a narrative for each HTML file
	for (let i = 0; i < htmlFiles.length; i++) {
		let imagesFolder = await _findImageFiles(htmlFiles[i]);

		await createNarrative({
			htmlFilePath: htmlFiles[i].path,
			imagesFolder,
			instanceUrl,
			token,
		});

		// Report on progress of uploads
		job.progress( Math.floor( ( (i + 1) / htmlFiles.length ) * 100) );
	}

	return Promise.resolve();
} // parseFolder

/**
 * Create Narrative
 */
const createNarrative = async ({
	htmlFilePath,
	imagesFolder = [],
	instanceUrl,
	token,
}) => {
	try {
		// Get the user id from the access token
		const user_id = token.split(':')[0];

		// Default client app post request option
		const _client = got.extend({
			prefixUrl: instanceUrl,
			headers: {
				token,
				'content-type': 'application/json',
			},
		})

		// Get the original HTML content as a string
		let htmlFileString = fs.readFileSync(htmlFilePath, 'utf8');

		// Generate Narrative uids and title
		const generatedUid = uid(16);
		// Ensure that UID is <= 30 letters. Generated UID length is 16 chars so the htmlFilePath portion of the name cannot be longer than 14 chars.
		// Also ensure that the UID does not contain chars other than dashes, underscores, letters, numbers, and periods.
		const narrativeUID = `${path.basename(htmlFilePath, path.extname(htmlFilePath)).substring(0, 13).replace(/[^-_\w\d.]+/gi, '_')}_${generatedUid}`;
		const narrativeTitle = `${path.basename(htmlFilePath, path.extname(htmlFilePath))}_${generatedUid}`;

		// Create a new narrative with the above generated uids and title
		util.log("Creating Narrative for site", instanceUrl);
		const newNarrative = await _client.post(`api/v1/narratives`, {
			body: JSON.stringify({
				"narrative": {
					"name": narrativeTitle,
					"uid": narrativeUID,
				}
			}),
		});

		// Get new narrative id
		const newNarrativeId = JSON.parse(newNarrative.body).narratives[0].id;

		if (imagesFolder.length) {
			util.log("Uploading Images");
			// Loop images folder and add images to the narrative document HTML
			for (let i = 0; i < imagesFolder.length; i++) {
				const image = imagesFolder[i];

				// Upload images to S3
				const s3_response = await uploadImageHelper({
					clientUrl: `${instanceUrl}/api/v1/files/s3_upload_signature`,
					token,
					imageName: image.filename,
					imagePath: image.path,
					modelId: newNarrativeId,
				});

				// Convert S3 XML response to JSON
				const parser = new xml2js.Parser();
				const s3_response_json = await parser.parseStringPromise(s3_response);

				// Create a File for each S3 iamge
				const file = await _client.post(`api/v1/files`, {
					body: JSON.stringify({
						"file": {
							"fileable_id": newNarrativeId,
							"fileable_type": "Narrative",
							"name": image.filename,
							"size": image.size,
							"type": image.mimetype,
							"key": s3_response_json.PostResponse.Key[0],
							"url": s3_response_json.PostResponse.Location[0],
							"storage_type": "s3",
							"user_agent": "AuditBoard/11.2.0-dev",
							"upload_user_id": user_id,
							"creator_user_id": null,
						}
					}),
				});

				util.log("Replacing Images inside html content");
				// Add a data-original-src attribute to the corresponding img tags in the HTML file with path set to the above S3 image file
				htmlFileString = htmlFileString.toString().replace(
					new RegExp(`"${image.baseFolder}/${image.filename}"`, "g"),
					` data-original-src="${s3_response_json.PostResponse.Location[0]}" data-file-id="${JSON.parse(file.body).files[0].id}" data-type="s3"`
				);
			}
		} // if imagesFolder.length

		// Get the full narrative
		util.log("Retrieve Document inside narrative");
		const getNarrative = await _client.get(`api/v1/narratives/${newNarrativeId}`, {
			headers: { token },
			searchParams: new URLSearchParams([['include', 'narrative:full']]),
		});

		// Get the narrative document
		const narrativeDocument = JSON.parse(getNarrative.body).documents[0];

		util.log("Upload document content with final html");
		// Update the narrative document with the new HTML
		await _client.put(`api/v1/documents/${narrativeDocument.id}`, {
			body: JSON.stringify({
				"document": {
					"body": htmlFileString,
				}
			})
		});

	} catch (e) {
		util.log(e);
		throw e;
	}
} // createNarrative

module.exports = {
	parseFolder,
	createNarrative,
}
