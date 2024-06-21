const crypto = require('crypto');

const hash = () => {
    return crypto.pbkdf2Sync('random_password', 'salt', 500000, 64, 'sha512').toString('hex');
};

module.exports = hash;