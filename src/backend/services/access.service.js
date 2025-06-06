
const { pool } = require('../models');


module.exports = {
  
  getAccountById: async (userId) => {
    const db = await pool;
    const query = 'SELECT * FROM TAI_KHOAN WHERE ma_tk = @ma_tk';
    const { recordset } = 
      await db.request()
              .input('ma_tk', userId)
              .query(query);
    return recordset[0];
  },

  getAccountByUsername: async (username) => {
    const db = await pool;
    const query = 'SELECT * FROM TAI_KHOAN WHERE ten_tai_khoan = @ten_tk';
    const { recordset } = 
      await db.request()
              .input('ten_tk', username)
              .query(query);
    return recordset[0];
  },

  createCustomerAccount: async (username, password) => {
    const db = await pool;
    const query = `INSERT INTO TAI_KHOAN (ten_tai_khoan, mat_khau, vai_tro) VALUES (@ten_tk, @mk, 'kh')`;
    await db.request().input('ten_tk', username).input('mk', password).query(query);
  }
  
}