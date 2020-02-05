const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const util = require("util");
const got = require("got");
const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

app.use("*", async (req, res) => {
 
  let url = req.query.targetUrl;
  let token = req.query.token;

  let option = {
    method: req.method,
    headers: {
      token: token
    }
  };

  if(req.method === "PUT" || req.method === "POST"){
    option.json = req.body;
    option.responseType = "json";
  }

  try {
    let payload = await got(url, option);
    return res.send(payload.body);
  } catch (error) {
    util.log(error.stack);
    return res.send(error.stack);
  }
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
