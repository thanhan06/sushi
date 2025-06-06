const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const path = require('path');

const crypto = require('crypto');

// Generate RSA key pair
function genKey() {
  crypto.generateKeyPair(
    'rsa',
    {
      modulusLength: 2048, // Key size in bits
      publicKeyEncoding: {
        type: 'pkcs1', // "Public Key Cryptography Standards 1"
        format: 'pem', // "Privacy-Enhanced Mail"
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    },
    (err, publicKey, privateKey) => {
      if (err) {
        console.error('Error generating key pair: ', err);
        return;
      }

      if (!process.env.JWT_PUBLIC_KEY || !process.env.JWT_PRIVATE_KEY) {
        fs.appendFileSync(
          path.join(__dirname, '../../../.env'), 
          `\nJWT_PUBLIC_KEY="${publicKey}"\n`
        );
        fs.appendFileSync(
          path.join(__dirname, '../../../.env'), 
          `JWT_PRIVATE_KEY="${privateKey}"\n`
        );
      }

      console.log('JWT keys generated successfully');
    },
  );
}

genKey();