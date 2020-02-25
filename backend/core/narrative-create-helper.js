const got = require("got");
const xml2js = require('xml2js');
const uploadImageHelper  = require("./upload-image-helper");
const path = require('path');
const fs = require('fs');
const cuid = require('cuid');
const util = require('util');

/**
 * Parse Folder
 */
const parseFolder = async ({
	folderPath,
	instanceUrl,
	token,
	job,
}) => {
	// Get files inside unzipped folder
	const files = fs.readdirSync(folderPath);
	// Filter for html files. We need this array length track progress
	const htmlFiles = files.filter(file => path.extname(file) === '.html');
	util.log("Files are: ", htmlFiles);

	// Create a narrative for each HTML file
	for (let i = 0; i < htmlFiles.length; i++) {
		let fileBasename = path.basename(htmlFiles[i], '.html');

		let imagesArray = [];

		// The images are in a folder that lives at the same level as the HTML file. The folder contains `.fld` extension but this might just be a Mac Word detail
		let imagesFolderPath = path.join(folderPath, fileBasename + '.fld');
		if (fs.statSync(imagesFolderPath).isDirectory()) {
			let imagesFolderFiles = fs.readdirSync(imagesFolderPath);
			util.log("Image files", imagesFolderFiles);
			// Loop and find all files with a png and jpg extension. Ignore any other kind of files
			for (let j = 0; j < imagesFolderFiles.length; j++) {
				let mimetype = path.extname(imagesFolderFiles[j]);
				if (mimetype === '.png' || mimetype === '.jpg') {
					imagesArray.push({
						filename: imagesFolderFiles[j],
						path: path.join(imagesFolderPath, imagesFolderFiles[j]),
						mimetype: mimetype === '.png' ? 'image/png' : 'image/jpeg',
						baseFolder: fileBasename + '.fld',
					});
				}
			}
		}

		await createNarrative({
			htmlFilePath: path.join(folderPath, htmlFiles[i]),
			imagesFolder: imagesArray,
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
		const narrativeUID = cuid();
		const narrativeTitle = `${path.basename(htmlFilePath, '.html')}-${narrativeUID}`;

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

		// Get the full narrative
		util.log("Retrieve Document inside narrative");
		const getNarrative = await _client.get(`api/v1/narratives/${newNarrativeId}`, {
			headers: { token },
			searchParams: new URLSearchParams([['include', 'full_narrative']]),
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
