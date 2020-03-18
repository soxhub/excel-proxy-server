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
			cb(null, {fieldName: file.fieldname});
		},
		key: function (req, file, cb) {
			cb(null, 'upload/' + shortid.generate() + file.originalname);
		}
	})
} else {
	storage = multer.diskStorage({
		destination: function(req, file, cb) {
			cb(null, path.join(__dirname+'/uploads'));
		},
		filename: function(req, file, cb) {
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
app.use(bodyParser.json());

app.post("/api/upload", upload, async function(req, res) {
	const { token, url:instanceUrl } = req.body;
	try {
		const zipPath = isProd ? req.files[0].key : req.files[0].path;

		addNarratives({
			token,
			instanceUrl,
			zipPath,
		});

		res.send({ 'message': 'file upload has been initiated' })
	} catch(err) {
		console.log('error: ', err);
	}
});

app.use("/proxy", async (req, res) => {
  let url = req.query.targetUrl;
  let token = req.query.token;

  let option = {
    method: req.method,
    headers: {
      token: token
    },
    responseType: "text"
  };

  if (req.method === "PUT" || req.method === "POST") {
    option.json = req.body;
  }

  try {
    let payload = await got(url, option);
    let statusOnPayload = payload.statusCode;
    return res.status(statusOnPayload).send(payload.body);
  } catch (error) {
    let errorMsg;
    let errorStatus;

    if(error.response === undefined){
      util.log(error);
      errorMsg = {message: error.message};
      errorStatus = 404;
    } else {
      util.log(error.response.body);
      errorMsg = error.response.body;
      errorStatus = error.response.statusCode
    }
		return res.status(errorStatus).send(errorMsg);
  }

});

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
