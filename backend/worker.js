const Queue = require("bull");
const got = require("got");
const archiver = require('archiver');

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const MAX_JOBS_PER_WORKER = 2;

const workQueue = new Queue('narrative_upload', REDIS_URL);

workQueue.process(MAX_JOBS_PER_WORKER, async (job) => {
	// console.log(job);
	console.log('wow');

	// unzip

	// #looping thru every narrative
		// create narrative, call GET endpoint to get the inside document
		let response = await got('http://localhost:9002/api/v1/narratives', {
			method: 'POST',
			headers: {
				'token': '1:b0f1d8545747d44296775c8ec7236c200318d4be',
			},
			body: {
				"narrative": {
					"created_at": null,
					"updated_at": null,
					"deleted_at": null,
					"previous_values": {},
					"save_options": {},
					"_permissions": {},
					"body": null,
					"name": "test21",
					"uid": "test21",
					"description": null,
					"category": null,
					"last_revision_date": null,
					"last_revision_by_user_id": null,
					"narrative_type_id": null
				}
			}
		})

		// const response = await got('http://localhost:9002/api/v1/narratives/47', {
		// 	method: 'GET',
		// 	headers: {
		// 		'token': '1:b0f1d8545747d44296775c8ec7236c200318d4be',
		// 	},
		// })

		// console.log('response: ', response);

		// upload images
		// using /file endpoint on soxhub-api

		// go thru html and replace relative file with absoluate file url
		// file://<string>/image0.png
		// replace with data_file_id data_file_type and s3 link


		// upload the document with the newly replaced final utra format html

	return {};
});
