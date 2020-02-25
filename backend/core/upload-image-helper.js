const request = require('request');
const got = require('got');
const FormData = require('form-data');
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
		const form_data  = new FormData();
		form_data.append('file_name', imageName);
		form_data.append('model_name', 'narrative');
		form_data.append('model_id', modelId);

		const { body } = await got.post(clientUrl, {
			headers: {
				token,
			},
			body: form_data,
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
