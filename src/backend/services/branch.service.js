
const { pool } = require('../models');

module.exports = {

  getBranches: async ({ area }) => {
    const db = await pool;
    const query = `
      SELECT * 
      FROM CHI_NHANH
      WHERE (@ten_kv IS NULL OR ten_kv = @ten_kv)
    `;
    const { recordset } = await db.request().input('ten_kv', area).query(query);

    return recordset;
  },

  getAreas: async () => {
    const db = await pool;
    const query = 'SELECT * FROM KHU_VUC';
    const { recordset } = await db.request().query(query);
    
    return recordset;
  }

}