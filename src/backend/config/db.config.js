require('dotenv').config();

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;

module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  NAME: process.env.DB_NAME,
  CONNECTION_TIMEOUT: 10 * SECONDS,
  REQUEST_TIMEOUT: 1 * MINUTES
}