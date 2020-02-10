var conf = require('config');

function ipAddress() {
    return (req, res, next) => {
        let userAddress = req.ip;
        let addressSplit = userAddress.split('.');
        addressSplit.pop();
        let finalAddress = addressSplit.join('.');

        conf.get('ip_address').split(',').includes(finalAddress) ? next() : res.end();
    };
}

module.exports = ipAddress;