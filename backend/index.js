const logger = require("./middlewares/logger");
const accessValidation = require("./middlewares/access-validation");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const util = require("util");
const got = require("got");
const multer = require("multer");
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3001;
const { addNarratives } = require('./core/narrative-upload');
const s3 = require('./core/s3');
const db = require('./db');
const { UI } = require('bull-board');
const shortid = require('shortid');
const multerS3 = require('multer-s3');
const config = require('config');

let storage;
let isProd = process.env.NODE_ENV === 'production';

if (isProd) {
	storage = multerS3({
		s3,
		bucket: config.get('bucket'),
		metadata: function (req, file, cb) {
			cb(null, { fieldName: file.fieldname });
		},
		key: function (req, file, cb) {
			cb(null, 'upload/' + shortid.generate() + file.originalname);
		}
	})
} else {
	storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, path.join(__dirname + '/uploads'));
		},
		filename: function (req, file, cb) {
			cb(null, shortid.generate() + file.originalname);
		}
	});
}

const upload = multer({ storage }).any();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/api/queues', UI);
app.use(accessValidation());

app.use(logger());
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json({ limit: "50mb" }));

app.post("/api/upload", upload, async function (req, res) {
	const { token, url: instanceUrl } = req.body;
	try {
		const zipPath = isProd ? req.files[0].key : req.files[0].path;

		addNarratives({
			token,
			instanceUrl,
			zipPath,
		});

		res.send({ 'message': 'file upload has been initiated' })
	} catch (err) {
		console.log('error: ', err);
	}
});

app.use("/proxy", async (req, res) => {
	const { targetUrl, token } = req.query;
	const { method } = req;

	// gotOptions will be passed to "got" to make the request to the AB API
	const gotOptions = {
		method,
		headers: { token },
		responseType: "text"
	};

	if (method === "PUT" || method === "POST") {
		gotOptions.json = req.body;
	}

	// statusCode and responseBody will be returned by this server
	let statusCode;
	let responseBody;

	try {
		const payload = await got(targetUrl, gotOptions);
		statusCode = payload.statusCode;
		responseBody = payload.body;
	} catch (error) {
		if (error.response === undefined) {
			util.log(error);
			statusCode = 404;
			responseBody = { message: error.message };
		} else {
			util.log(error.response.body);
			statusCode = error.response.statusCode;
			responseBody = error.response.body;
		}
	} finally {
		// save log entry to the database for the current request
		try {
			await db.saveLogEntry(method, targetUrl, token, statusCode);
		} catch (error) {
			util.log(error);
		}

		// return a response to the client 
		return res.status(statusCode).send(responseBody);
	}
});

db.initializeDatabase()
	.then(() => {
		app.listen(PORT, () => {
			util.log(`App listening on port ${PORT}!`);
		});
	});
