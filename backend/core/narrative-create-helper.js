const got = require("got");
const xml2js = require('xml2js');
const uploadImageHelper  = require("./upload-image-helper");
const path = require('path');
const fs = require('fs');
const util = require('util');

const parse =  async ({ token, instanceUrl, folderPath }) => {
	const files = fs.readdirSync(folderPath);
	util.log('parse files: ', files);

	for (let i = 0; i < files.length; i++) {
		let ext = path.extname(files[i]);
		if (ext !== '.html') {
			continue;
		}

		let fileBasename = path.basename(files[i], '.html');
		let imagesArray = [];
		let imagePath = path.join(folderPath, fileBasename + '.fld');
		if (fs.statSync(imagePath).isDirectory()) {
			let images = fs.readdirSync(imagePath);
			for (let j = 0; j < images.length; j++) {
				let mimetype = path.extname(images[j]);
				util.log('mimetype: ', mimetype);
				util.log(mimetype !== '.png');
				if (mimetype === '.png' || mimetype === '.jpg') {
					util.log('cool');
					imagesArray.push({
						filename: images[j],
						path: path.join(imagePath, images[j]),
						mimetype: mimetype === '.png' ? 'image/png' : 'image/jpeg',
						baseFolder: fileBasename + '.fld',
					});
				}
			}
		}

		await create({
			instanceUrl,
			token,
			htmlFilePath: path.join(folderPath, files[i]),
			imageFolder: imagesArray
		});
	}
}

const create = async ({ instanceUrl, token, htmlFilePath, imageFolder = [] }) => {
	util.log('create start');
	const user_id = token.split(':')[0];
	const narrativeName = Math.floor(Math.random() * 100000) + path.basename(htmlFilePath, '.html');
	const newNarrative = await got.post(`${instanceUrl}/api/v1/narratives`, {
		headers: {
			token,
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			"narrative": {
				"name": narrativeName,
				"uid": narrativeName,
			}
		}),
	})

	const newNarrativeId = JSON.parse(newNarrative.body).narratives[0].id;
	util.log('create narrative: ', newNarrativeId);

	let htmlString = fs.readFileSync(htmlFilePath, "utf8");
	util.log('htmlString: ', htmlString);

	util.log('create imageFolder length: ', imageFolder.length);
	for (let i = 0; i < imageFolder.length; i++) {
		let image = imageFolder[i];

		const s3_response = await uploadImageHelper({
			clientUrl: `${instanceUrl}/api/v1/files/s3_upload_signature`,
			token,
			imageName: image.filename,
			imagePath: image.path,
			modelId: newNarrativeId,
		});

		const parser = new xml2js.Parser();
		const s3_response_json = await parser.parseStringPromise(s3_response);

		let file = await got.post(`${instanceUrl}/api/v1/files`, {
			headers: {
				token,
				"content-type": "application/json",
			},
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

		util.log('create file id: ', JSON.parse(file.body).files[0].id);

		util.log(`${image.baseFolder}/${image.filename}`);

		htmlString = htmlString.toString().replace(new RegExp(`"${image.baseFolder}/${image.filename}"`, "g"), ` data-original-src="${s3_response_json.PostResponse.Location[0]}" data-file-id="${JSON.parse(file.body).files[0].id}" data-type="s3"`);
	}

	const getNarrative = await got.get(`${instanceUrl}/api/v1/narratives/${newNarrativeId}`, {
		headers: {
			token,
		},
		searchParams: new URLSearchParams([['include', 'full_narrative']]),
	});


	const narrativeDocument = JSON.parse(getNarrative.body).documents[0];

	util.log(htmlString)

	const newDocument = await got.put(`${instanceUrl}/api/v1/documents/${narrativeDocument.id}`, {
		headers: {
			token,
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			"document": {
				"body": htmlString,
			}
		})
	});

}

module.exports = {
	parse,
	create,
}
