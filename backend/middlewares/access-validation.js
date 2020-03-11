
const util = require("util");
const config = require('config');

function accessValidation() {
  return (req, res, next) => {
  	const token = req.query.accessToken || null;

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

module.exports = accessValidation;
