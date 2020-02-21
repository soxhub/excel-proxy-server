const request = require('request');
const got = require('got');
const FormData = require('form-data');
const fs= require('fs');

module.exports = async ({
	clientUrl,
	imageName,
	imagePath,
	modelId,
	token,
}) => {
	const form_data  = new FormData();
	form_data.append('file_name', imageName);
	form_data.append('model_name', 'narrative');
	form_data.append('model_id', modelId);

	const { body } = await got.post(clientUrl, {
		headers: {
			token,
		},
		body: form_data
	});

	const s3_signed_response = JSON.parse(body);

	const options = {
		'method': 'POST',
		'url': s3_signed_response.url,
		'headers': {
			'Content-Type': 'multipart/form-data;'
		},
		formData: {
			...s3_signed_response.formData,
			file: fs.createReadStream(imagePath),
		}
	};

	return new Promise((res, rej) => {
		request(options, function (error, response) {
			if (error) throw new Error(error);
			res(response.body);
		});
	});
}
