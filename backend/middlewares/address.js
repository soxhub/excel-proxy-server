var conf = require("config");
const requestIp = require('request-ip');

function ipAddress() {
	return (req, res, next) => {

		// Get the last three octects of ip address
		let ip = requestIp.getClientIp(req);

		let addressSplit = ip.split(".");
		addressSplit.pop();
		let finalAddress = addressSplit.join(".");

		const allowAddress = conf.get("ip_address").split(',').map(item => item.trim());
		console.log("allowed address", allowAddress);

		// Check to see if incoming ip is in config vars
		allowAddress.includes(finalAddress) ? next() : res.status(401).send({ message: "Unauthorized" });
	};
}

module.exports = ipAddress;
