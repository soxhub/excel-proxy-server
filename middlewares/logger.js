const util = require("util");


function logger() {
  return (req, res, next) => {
    util.log(req.method, req.originalUrl);
    next();
  };
}

module.exports = logger;