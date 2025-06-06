const { pool } = require('../models');
const sql=require('mssql');
module.exports= {
    postOrdersOnline: async ({ma_tk,sdt,ma_chi_nhanh,loai_dat,dia_chi,ngay_giao,ds_mon_an}) => {
        const db=await pool;
        const tvp = new sql.Table('ds_mon_an'); 
        tvp.columns.add('ma_mon', sql.Int);
        tvp.columns.add('so_luong', sql.Int);
        ds_mon_an.forEach(item => {
            tvp.rows.add(item.ma_mon, item.so_luong);
        });
        const query='EXEC sp_tao_don_hang_online_va_them_mon @ma_tk,@sdt,@ma_cn,@loai_dat,@dia_chi,@ngay_giao,@ds_mon_an';
        await db.request()
                    .input('ma_tk',ma_tk)
                    .input('sdt',sdt)
                    .input('ma_cn',ma_chi_nhanh)
                    .input('loai_dat',loai_dat)
                    .input('dia_chi',dia_chi)
                    .input('ngay_giao',sql.DateTime,ngay_giao)
                    .input('ds_mon_an',tvp)
                    .query(query);

    },

    getCusordersOnline: async (ma_tk) => {
        const db=await pool;
        const query= `SELECT* FROM DON_HANG_ONLINE dh
                      LEFT JOIN PHIEU_DAT pd on dh.ma_phieu=pd.ma_phieu
                      LEFT JOIN HOA_DON hd on hd.ma_phieu=pd.ma_phieu 
                      WHERE ma_tk=@ma_tk`;
        const {recordset}=await db.request().input('ma_tk',ma_tk).query(query);
        return recordset;                
    }
}