var conf = require("config");
const requestIp = require('request-ip');

function ipAddress() {
  return (req, res, next) => {
    // Check to see if users ip is in IPv6 format
    let ip = req.ip;
    if (ip.substr(0, 7) == "::ffff:") {
      ip = ip.substr(7);
    }
    console.log(ip);
    console.log(requestIp.getClientIp(req));

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
