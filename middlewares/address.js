var conf = require('config');

function ipAddress() {
    return (req, res, next) => {
        let userAddress = req.ip;
        let addressSplit = userAddress.split('.');
        addressSplit.pop();
        let finalAddress = addressSplit.join('.');

        finalAddress === conf.get('ELS.IP_ADDRESS') || finalAddress === conf.get('CER.IP_ADDRESS') ? next() : res.end();
    };
}

module.exports = ipAddress;