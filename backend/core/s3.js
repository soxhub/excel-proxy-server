

const aws = require('aws-sdk');
const config = require('config');
const s3 = new aws.S3({
	accessKeyId: config.get('accessKeyId'),
	secretAccessKey: config.get('secretAccessKey')
});

module.exports = s3;
