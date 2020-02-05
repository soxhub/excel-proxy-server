const express = require("express");
const got = require("got");
var cors = require("cors");
const app = express();
const port = 8080;

app.use(cors());


app.get("*", async (req, res) => {
  let url = req.query.targetUrl;
  let token = req.query.token;
  try {
    let g = await got.get(url, {
      headers: {
        token: token
      }
    });
    res.json(g.body);
  } catch (error) {
    res.json(error.response.body);
  }
});

app.put("*", async (req, res) => {
  let url = req.query.targetUrl;
  let token = req.query.token;
  try {
    let pu = await got.put(url, {
      headers: {
        token: token
      }
    });
    console.log(req.body);
    res.json(pu.body);
  } catch (error) {
    res.json(error.response.body);
  }
});

app.post("*", async (req, res) => {
  let url = req.query.targetUrl;
  let token = req.query.token;
  try {
    let p = await got.post(url, {
      headers: {
        token: token
      }
    });
    res.json(p.body);
  } catch (error) {
    res.json(error.response.body);
  }
});

app.delete("*", async (req, res) => {
  let url = req.query.targetUrl;
  let token = req.query.token;
  try {
    let d = await got.delete(url, {
      headers: {
        token: token
      }
    });
    res.json(d.body);
  } catch (error) {
    res.json(error.response.body);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
