var conf = require("config");
const requestIp = require('request-ip');

function ipAddress() {
  return (req, res, next) => {
    let ip = requestIp.getClientIp(req);

    let addressSplit = ip.split(".");
    addressSplit.pop();
    let finalAddress = addressSplit.join(".");

    console.log(req.ip);
    conf
      .get("ip_address")
      .split(",")
      .includes(finalAddress)
      ? next()
      : res.status(401).send({ message: "Unauthorized" });
  };
}

module.exports = ipAddress;
