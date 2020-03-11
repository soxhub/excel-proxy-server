
const util = require("util");
const config = require('config');

function headerValidation() {
  return (req, res, next) => {
  	const token = req.headers["access-token"] || null;

		const isValid = !!token && token === config.get('accessToken');

		if (!isValid) {
			return res.status(401).send({
				message: 'Unauthorized'
			})
		} else {
			next();
		}
  };
}

module.exports = headerValidation;
