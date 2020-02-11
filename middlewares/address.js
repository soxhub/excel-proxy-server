var conf = require("config");
const requestIp = require('request-ip');

function ipAddress() {
  return (req, res, next) => {
    let ip = requestIp.getClientIp(req);
    console.log(requestIp.getClientIp(req))

    let addressSplit = ip.split(".");
    addressSplit.pop();
    let finalAddress = addressSplit.join(".");

    console.log('list of ip addresses ', conf.get("ip_address"));
    conf.get("ip_address").includes(finalAddress)? next(): res.status(401).send({ message: "Unauthorized" });
  };
}

module.exports = ipAddress;
