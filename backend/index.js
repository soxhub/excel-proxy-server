const logger = require("./middlewares/logger");
const address = require("./middlewares/address");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const util = require("util");
const got = require("got");
const multer = require("multer");
const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now()+ '-' + file.originalname );
  }
});

const upload = multer({ storage: storage }).single('myNarrative');

app.use('/', express.static(path.join(__dirname, 'public')));

app.use(logger());
app.use(address());
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());

app.post("/api/upload", upload, async function(req, res) {
  res.send(req.body);
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
