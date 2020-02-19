const request = require('request');
const FormData = require('form-data');

module.exports = async ({clientUrl, token, imageName, imagePath, modelId}) => {
	const form_data  = new FormData();
	form_data.append('file_name', imageName);
	form_data.append('model_name', 'narrative');
	form_data.append('model_id', modelId);

	const { body } = await got.post(clientUrl, {
		headers: {
			"token": token,
		},
		body: form_data
	});

	const s3_response_formData = JSON.parse(body);

	const options = {
		'method': 'POST',
		'url': 'https://soxhub-dev.s3-us-west-2.amazonaws.com/',
		'headers': {
			'Content-Type': 'multipart/form-data; boundary=--------------------------334576499562249033276841'
		},
		formData: {
			...s3_response_formData,
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
