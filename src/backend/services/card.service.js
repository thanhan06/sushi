const { pool } = require('../models');
const sql=require('mssql');
module.exports={
    getCards: async(page,pageSize) => {
        const db=await pool;
        console.log(page,pageSize);
        const query= `SELECT*
                      FROM THE
                      ORDER BY ma_the
                      OFFSET (@page - 1) * @pageSize ROWS
                      FETCH NEXT @pageSize ROWS ONLY`;
        const {recordset}=await db.request().input('page',page).input('pageSize',pageSize).query(query);
        return recordset;

    }
}