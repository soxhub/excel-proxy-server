var conf = require('config');

function ipAddress() {
    return (req, res, next) => {
        let userAddress = req.ip;
        let addressSplit = userAddress.split('.');
        addressSplit.pop();
        let finalAddress = addressSplit.join('.');

        conf.get('ip_address').split(',').includes(finalAddress) ? next() : res.status(401).send({ message: 'Unauthorized' });
    };
}

module.exports = ipAddress;