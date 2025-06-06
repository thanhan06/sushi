const { pool } = require("../models");
const sql=require('mssql');
module.exports = {
  getAllDishTypes: async () => {
    const db = await pool;
    const query = `
      SELECT *
      FROM LOAI_MON_AN
    `;
    const { recordset } = await db.request().query(query);
    return recordset;
  },

  getAllDishes: async ({ area, branch, name, type }) => {
    const db = await pool;
    const query = `
      SELECT *
      FROM MON_AN ma
      WHERE (@ten_mon IS NULL OR ma.ten_mon LIKE @ten_mon)
      AND (@loai_mon IS NULL OR ma.loai = @loai_mon) 
      AND (@ma_cn IS NULL OR ma.ma_mon IN (
        SELECT cttd.ma_mon
        FROM CT_THUC_DON cttd
        JOIN CHI_NHANH cn ON cn.ten_kv = cttd.ten_kv
        WHERE cn.ma_cn = @ma_cn
        EXCEPT 
        SELECT ma_mon
        FROM MON_KHONG_PV
        WHERE ma_cn = @ma_cn
      ))
      AND (@ten_kv IS NULL OR ma.ma_mon IN (
        SELECT cttd.ma_mon
        FROM CT_THUC_DON cttd
        WHERE cttd.ten_kv = @ten_kv
      ))
    `;
  const formattedName = name ? `%${name}%` : null;
  const { recordset } = await db
    .request()
    .input("ten_mon", formattedName) // Truyền giá trị đã định dạng
    .input("loai_mon", type)
    .input("ma_cn", branch)
    .input("ten_kv", area)
    .query(query);
    return recordset;
  },


  getDishByDishId: async (dishId) => {
    const db = await pool;
    const query = `
      SELECT *
      FROM MON_AN
      WHERE ma_mon = @ma_mon
    `;
    const { recordset } = await db
      .request()
      .input("ma_mon", dishId)
      .query(query);
    return recordset[0];
  },
  
  deleDishArea: async (dishId,area) => {
    const db=await pool;
    const query= ` DELETE FROM CT_THUC_DON
                   WHERE ma_mon=@ma_mon AND ten_kv=@ten_kv `;
    await db.request().input('ma_mon',dishId).input('ten_kv',area).query(query);                      
  },

  addDishNotService: async (dishId,branch) => {
    const db=await pool;
    const query=`INSERT INTO MON_KHONG_PV VALUES (@ma_mon,@ma_cn)`;
    await db.request().input('ma_mon',dishId).input('ma_cn',branch).query(query);
  },

  updateDish: async (dishId,gia_hien_tai,giao_hang) => {
    const db=await pool;
    let query=`UPDATE MON_AN SET `;
    if(gia_hien_tai) {
      query+=`gia_hien_tai=@gia_hien_tai `
    }
    if(giao_hang) {
      query+= (gia_hien_tai ? ',' :"") +`giao_hang=@giao_hang`;
    }
    query+=` WHERE ma_mon=@ma_mon`;
    const request=db.request();
    request.input('ma_mon',dishId);
    if(gia_hien_tai) request.input('gia_hien_tai',gia_hien_tai);
    if(giao_hang) request.input('giao_hang',giao_hang);
    await request.query(query);
  },

  addDish: async (ten_mon, gia, loai, gia_hien_tai, giao_hang, img) => {
    const db = await pool;
    const query = `EXEC sp_them_mon_an @ten_mon,@gia,@loai ,@gia_hien_tai, @giao_hang`;
    const result = await db.request()
      .input("ten_mon",sql.NVarChar, ten_mon)
      .input("gia",sql.Int, gia)
      .input("loai",sql.Int, loai)
      .input("gia_hien_tai",sql.Int, gia_hien_tai)
      .input("giao_hang", giao_hang)
      .query(query);
  }

}

