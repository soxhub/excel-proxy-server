const logger = require("./middlewares/logger");
const address = require("./middlewares/address");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const util = require("util");
const got = require("got");
const multer = require("multer");
const mammoth = require("mammoth");
const app = express();
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const delay = require('delay');
const PORT = process.env.PORT || 3001;
const upload_image_helper  = require("./core/upload_image_helper");
var request = require('request');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname+'/uploads'));
  },
  filename: function(req, file, cb) {
		// cb(null, Date.now() + '-' + file.originalname );
		cb(null, file.originalname );
  }
});

const upload = multer({ storage: storage }).any();

app.use(logger());
app.use(address());
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());

// app.post("/upload", upload);
app.post("/upload", upload, async function(req, res) {
	try {




		// await got.post('http://localhost:9002/api/v1/files', {
		// 	headers: {
		// 		"token": "1:4df11c52efb4f1bae814eb3767e70d1f3808f6d0",
		// 		"content-type": "application/json",
		// 	},
		// 	body: JSON.stringify({
		// 		"file": {
		// 			"_permissions": {},
		// 			"created_at": null,
		// 			"updated_at": null,
		// 			"deleted_at": null,
		// 			"previous_values": {},
		// 			"save_options": {},
		// 			"fileable_id": "69",
		// 			"fileable_type": "Narrative",
		// 			"name": "image2.jpg",
		// 			"comments": "",
		// 			"size": "34798",
		// 			"type": "image/jpeg",
		// 			"key": "shv3/v1/narrative/69/98a949f4-47f6-4b0c-9df7-84767c9b0112/image.jpg",
		// 			"url": "https://soxhub-dev.s3-us-west-2.amazonaws.com/shv3%2Fv1%2Fnarrative%2F69%2F98a949f4-47f6-4b0c-9df7-84767c9b0112%2Fimage.jpg",
		// 			"embed_url": null,
		// 			"thumb_url": null,
		// 			"image_url": null,
		// 			"storage_type": "s3",
		// 			"meta": {},
		// 			"user_agent": "AuditBoard/11.2.0-dev",
		// 			"upload_user_id": "1",
		// 			"creator_user_id": null,
		// 		}
		// 	}),
		// })

		// const newNarrative = await got.post('http://localhost:9002/api/v1/narratives', {
		// 	headers: {
		// 		'token': '1:273ea6d67d89adfcb091e1e55244c32ef0c63ddf',
		// 		'content-type': 'application/json',
		// 	},
		// 	body: JSON.stringify({
		// 		"narrative": {
		// 			"created_at": null,
		// 			"updated_at": null,
		// 			"deleted_at": null,
		// 			"previous_values": {},
		// 			"save_options": {},
		// 			"_permissions": {},
		// 			"body": null,
		// 			"name": `test${Math.floor(Math.random() * 1000)}`,
		// 			"uid": `test${Math.floor(Math.random() * 1000)}`,
		// 			"description": null,
		// 			"category": null,
		// 			"last_revision_date": null,
		// 			"last_revision_by_user_id": null,
		// 			"narrative_type_id": null
		// 		}
		// 	}),
		// })

		// const newNarrativeId = JSON.parse(newNarrative.body).narratives[0].id;


		// const getNarrative = await got.get(`http://localhost:9002/api/v1/narratives/${newNarrativeId}`, {
		// 	headers: {
		// 		'token': '1:273ea6d67d89adfcb091e1e55244c32ef0c63ddf',
		// 	},
		// 	searchParams: new URLSearchParams([['include', 'full_narrative']]),
		// });


		// const narrativeDocument = JSON.parse(getNarrative.body).documents[0];

		// // console.log('getNarrative: ', getNarrative);
		// console.log('narrativeDocument: ', narrativeDocument);

		// const newDocument = await got.put(`http://localhost:9002/api/v1/documents/${narrativeDocument.id}`, {
		// 	headers: {
		// 		'token': '1:273ea6d67d89adfcb091e1e55244c32ef0c63ddf',
		// 		'content-type': 'application/json',
		// 	},
		// 	body: JSON.stringify({
		// 		"document": {
		// 			"created_at": narrativeDocument.created_at,
		// 			"updated_at": narrativeDocument.updated_at,
		// 			"deleted_at": narrativeDocument.deleted_at,
		// 			"previous_values": {
		// 				"body": narrativeDocument.body
		// 			},
		// 			"page_layout": narrativeDocument.page_layout,
		// 			"save_options": {},
		// 			"body": '<p>wow</p>',
		// 		}
		// 	})
		// });

		// console.log('newDocument: ', newDocument);
	} catch (error) {
		console.log(error);
		console.log(error.message);
		console.log('error: ', error.stack);
	} finally {
		res.send({test: "hello"})
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

app.listen(PORT, () => console.log(`Proxy listening on port ${PORT}!`));
