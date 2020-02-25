const logger = require("./middlewares/logger");
const address = require("./middlewares/address");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const util = require("util");
const got = require("got");
const multer = require("multer");
const app = express();
const path = require('path');
const rimraf = require('rimraf');
const PORT = process.env.PORT || 3001;
const { queue, addNarratives } = require('./core/narrative-upload');
const { UI } = require('bull-board');
const shortid = require('shortid');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname+'/uploads'));
  },
  filename: function(req, file, cb) {
		cb(null, shortid.generate() + file.originalname);
  }
});

const upload = multer({ storage: storage }).any();

app.use('/', express.static(path.join(__dirname, 'public')));

app.use(logger());
app.use(address());
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use('/api/queues', UI);

app.post("/api/upload", upload, async function(req, res) {
	const { token, url:instanceUrl } = req.body;

	try {
		addNarratives({
			token,
			instanceUrl,
			zipPath: req.files[0].path,
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
    return res.send(payload.body);
  } catch (error) {
    util.log(error.stack);
    return res.send(error.stack);
  }
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
