const crypto = require('crypto');

const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function generateShortCode(length = 6) {
  const bytes = crypto.randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS[bytes[i] % BASE62_CHARS.length];
  }
  
  return result;
}

module.exports = {
  generateShortCode
};