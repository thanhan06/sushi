const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

class JWT {
  static generateToken(userId, expiresInDays = 7) {
    const expiresInSeconds = expiresInDays * 24 * 60 * 60; // 1 day in seconds
    const payload = {
      sub: {
        ma_tk: userId
      },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    };

    return jwt.sign(payload, process.env.JWT_PRIVATE_KEY, { algorithm: 'RS256' });
  }

  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
  }
}

module.exports = JWT;
