const sql = require('mssql');

const dbconfig = require('../config/db.config.js');

const config = {
  driver: 'SQL Server',
  server: dbconfig.HOST,
  database: dbconfig.NAME,
  user: dbconfig.USER,
  password: dbconfig.PASSWORD,
  options: {
    encrypt: false,
    enableArithAbort: false
  },
  connectionTimeout: dbconfig.CONNECTION_TIMEOUT,
  requestTimeout: dbconfig.REQUEST_TIMEOUT

};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config:\n ', err);
    throw err;
  });

module.exports = {
  sql,
  pool: poolPromise
};

