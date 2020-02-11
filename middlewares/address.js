var conf = require("config");
const requestIp = require('request-ip');

function ipAddress() {
  return (req, res, next) => {
    let ip = '104.61.86.43';
    // requestIp.getClientIp(req);
    console.log(requestIp.getClientIp(req))

    let addressSplit = ip.split(".");
    addressSplit.pop();
    let finalAddress = addressSplit.join(".");

    console.log(conf.get("ip_address"));
    console.log(conf.get("ip_address").split(","));
    conf.get("ip_address").split(",").includes(finalAddress)? next(): res.status(401).send({ message: "Unauthorized" });
  };
}

module.exports = ipAddress;
