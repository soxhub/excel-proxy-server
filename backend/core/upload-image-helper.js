const request = require('request');
const got = require('got');
const fs= require('fs');

/**
 * Get S3 signed response
 */
const getS3SignedResponse = ({
	imageName,
	modelId,
	clientUrl,
	token,
}) => {
	return new Promise(async (res, rej) => {
		const { body } = await got.post(clientUrl, {
			headers: {
				token,
				'content-type': 'application/x-www-form-urlencoded',
			},
			form: {
				'file_name': imageName,
				'model_name': 'narrative',
				'model_id': modelId,
			}
		});

		res(JSON.parse(body));
	});
}

module.exports = async ({
	clientUrl,
	imageName,
	imagePath,
	modelId,
	token,
}) => {
	const { formData, url } = await getS3SignedResponse({
		imageName,
		modelId,
		clientUrl,
		token,
	});

	return new Promise(async (res, rej) => {
		request({
			'method': 'POST',
			'url': url,
			'headers': {
				'Content-Type': 'multipart/form-data;'
			},
			formData: {
				...formData,
				file: fs.createReadStream(imagePath),
			}
		}, function (error, response) {
			if (error) throw new Error(error);
			res(response.body);
		});
	});
}
