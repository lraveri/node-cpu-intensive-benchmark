const crypto = require('crypto');

const hash = (password, costFactor) => {
    return crypto.pbkdf2Sync(password, 'salt', costFactor, 64, 'sha512').toString('hex');
};

module.exports = hash;