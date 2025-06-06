const { pool } = require('../models');
const sql=require('mssql');
module.exports = {

  createCard: async (employeeId, {hoten, cccd, sdt, email, gioitinh}) => {
    const db = await pool;
    const query = 'EXEC sp_tao_the @nv_lap_the, @ho_ten, @cccd, @sdt, @email, @gioi_tinh';

    await db.request()
            .input('nv_lap_the', employeeId)
            .input('ho_ten', hoten)
            .input('cccd', cccd)
            .input('sdt', sdt)
            .input('email', email)
            .input('gioi_tinh',  gioitinh)
            .query(query);
  },

  getOrders: async (status, page, pageSize) => {
    const db = await pool;
    const request = db.request();
    let query = `
      SELECT pd.ma_phieu,pd.ma_chi_nhanh,pd.ma_ban,pd.nv_lap,pd.ngay_lap,pd.ngay_den,dh.loai_dat,dh.dia_chi
      FROM PHIEU_DAT pd
      LEFT JOIN DON_HANG_ONLINE dh ON pd.ma_phieu=dh.ma_phieu
      WHERE @trang_thai IS NULL OR trang_thai=@trang_thai
      ORDER BY pd.ma_phieu 
      OFFSET (@page - 1) * @pageSize ROWS
      FETCH NEXT @pageSize ROWS ONLY;
    `;
    request.input('page', page);
    request.input('pageSize', pageSize);
    request.input('trang_thai', status);
    const { recordset } = await request.query(query);
    return recordset;
  },

  postOrders: async(employeeId,{ ma_dh,ma_chi_nhanh,ma_ban,ngay_den,ds_mon_an }) =>{
    const db=await pool;
    const tvp = new sql.Table('ds_mon_an'); 
    tvp.columns.add('ma_mon', sql.Int);
    tvp.columns.add('so_luong', sql.Int);
    ds_mon_an.forEach(item => {
      tvp.rows.add(item.ma_mon, item.so_luong);
    });
    const query='EXEC sp_tao_phieu_va_them_mon @ma_dh,@ma_chi_nhanh,@ma_ban,@nv_lap,@ngay_den,@ds_mon_an';
    await db.request()
              .input('ma_dh',ma_dh)
              .input('ma_chi_nhanh',ma_chi_nhanh)
              .input('ma_ban',ma_ban)
              .input('nv_lap',employeeId)
              .input('ngay_den',ngay_den)
              .input('ds_mon_an',tvp)
              .query(query);
  },

  deleteOrders: async (ma_phieu) => {
    const db=await pool;
    const query='EXEC sp_xoa_phieu_dat @ma_phieu';
    await db.request().input('ma_phieu',sql.Int,ma_phieu).query(query);
  },

  postOrdersDetail: async (ma_phieu,ma_mon,so_luong) => {
    const db=await pool;
    const query='EXEC sp_them_chi_tiet_phieu_dat @ma_phieu,@ma_mon,@so_luong';
    await db.request()
                .input('ma_phieu',ma_phieu)
                .input('ma_mon',ma_mon)
                .input('so_luong',so_luong)
                .query(query);
  },
  
  deleteOrdersDetail: async (ma_phieu,ma_mon) => {
    const db=await pool;
    const query='EXEC sp_xoa_chi_tiet_phieu_dat @ma_phieu,@ma_mon';
    await db.request()
                .input('ma_phieu',ma_phieu)
                .input('ma_mon',ma_mon)
                .query(query);
  },

  updateOrdersDetail: async (ma_phieu,ma_mon,so_luong) => {
    const db=await pool;
    const query='EXEC sp_cap_nhat_chi_tiet_phieu_dat @ma_phieu,@ma_mon,@so_luong';
    await db.request()
                .input('ma_phieu',ma_phieu)
                .input('ma_mon',ma_mon)
                .input('so_luong',so_luong)
                .query(query);
  }, 

  getOrdersOnline: async (status, page, pageSize) => {
    const db = await pool;
    const request = db.request();
    let query = `
      SELECT * FROM DON_HANG_ONLINE
      WHERE @trang_thai IS NULL OR trang_thai=@trang_thai
      ORDER BY ma_dh 
      OFFSET (@page - 1) * @pageSize ROWS
      FETCH NEXT @pageSize ROWS ONLY;
    `;
    request.input('page', page);
    request.input('pageSize', pageSize);
    request.input('trang_thai', status);
    const {recordset}= await request.query(query);
    return recordset;
  },

  // deleteOrdersOnline: async (req,res) => {
  //   const db=await pool;
  //   const query='EXEC sp_xoa_phieu_dat @ma_phieu';
  //   await db.request().input('ma_phieu',sql.Int,ma_phieu).query(query);
  // }

  getBills: async (ma_the,start,end,page,pageSize) => {
    const db=await pool;
    const offset=(page-1)*pageSize;
    const query=`SELECT* FROM HOA_DON
                 WHERE @ma_the IS NULL OR ma_the=@ma_the
                 AND @start IS NULL OR ngay_xuat>=@start
                 AND @end IS NULL OR ngay_xuat<=@end
                 ORDER BY ma_phieu
                 OFFSET @offset ROWS
                 FETCH NEXT @pageSize ROWS ONLY
    `;
    const {recordset}=await db.request()
              .input('ma_the',ma_the)
              .input('start',sql.DateTime,start)
              .input('end',sql.DateTime,end)
              .input('pageSize',pageSize)
              .input('offset',offset)
              .query(query);
    return recordset;
  },

  postBills: async(ma_phieu,sdt,employeeId) => {
    const db=await pool;
    const query='EXEC sp_thanh_toan @ma_phieu,@sdt,@nhan_vien_thanh_toan';
    await db.request()
              .input('ma_phieu',ma_phieu)
              .input('sdt',sdt)
              .input('nhan_vien_thanh_toan',employeeId)
              .query(query);
  },

  deleteBills: async(ma_phieu) => {
    const db=await pool;
    const query='EXEC sp_xoa_hoa_don @ma_phieu';
    await db.request()
              .input('ma_phieu',ma_phieu)
              .query(query);
  },
  reviewBills: async(ma_phieu,{ diem_vi_tri,diem_phuc_vu,diem_mon_an,diem_gia_ca,diem_khong_gian,binh_luan }) => {
    const db=await pool;
    const query='EXEC sp_them_danh_gia @ma_phieu,@diem_vi_tri,@diem_phuc_vu,@diem_mon_an,@diem_gia_ca,@diem_khong_gian,@binh_luan';
    await db
            .request()
            .input("ma_phieu", ma_phieu)
            .input("diem_vi_tri", diem_vi_tri)
            .input("diem_phuc_vu", diem_phuc_vu)
            .input("diem_mon_an", diem_mon_an)
            .input("diem_gia_ca", diem_gia_ca)
            .input("diem_khong_gian", diem_khong_gian)
            .input("binh_luan", binh_luan)
            .query(query);

  },

  addEmp: async ({ten_tk, mat_khau, ma_cn, ho_ten, gioi_tinh, sdt, dia_chi, ngay_sinh, ma_bo_phan}) => {
    const db = await pool;
    await db.request()
            .input('ten_tk', ten_tk)
            .input('mat_khau', mat_khau)
            .input('ma_cn', ma_cn)
            .input('ho_ten', ho_ten)
            .input('gioi_tinh', gioi_tinh)
            .input('sdt', sdt)
            .input('dia_chi', dia_chi)
            .input('ngay_sinh', ngay_sinh)
            .input('ma_bo_phan', ma_bo_phan)
            .execute('usp_them_nhan_vien');
  },

  getWorkingEmployees: async ({ ma_cn, ten_kv, page, pageSize }) => {
    const db = await pool;
    const offset = (page - 1) * pageSize;
    const query = `
      SELECT DISTINCT nv.ma_nv, nv.ho_ten, nv.gioi_tinh, nv.sdt, nv.dia_chi, nv.ngay_sinh, nv.ma_bo_phan, bp.ten_bp
      FROM NHAN_VIEN_DANG_LV nv
      JOIN BO_PHAN bp ON nv.ma_bo_phan = bp.ma_bp
      JOIN CHI_NHANH cn ON cn.ma_cn = nv.ma_chi_nhanh 
      WHERE (@ten_kv IS NULL OR cn.ten_kv = @ten_kv)
      AND (@ma_cn IS NULL OR cn.ma_cn = @ma_cn)
      ORDER BY nv.ma_nv
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY;
    `;
    const { recordset } = await db.request()
                                  .input('ma_cn', ma_cn)
                                  .input('ten_kv', ten_kv)
                                  .input('offset', offset)
                                  .input('pageSize', pageSize)
                                  .query(query);
    return recordset;
},


  relocateEmp: async ({ma_nv, ma_cn, ngay_bd}) => {
    const db = await pool;
    await db.request()
            .input('ma_nv', ma_nv)
            .input('ma_chi_nhanh', ma_cn)
            .input('thoi_gian_bat_dau', ngay_bd)
            .input('thoi_gian_ket_thuc', null)
            .execute('usp_them_lich_su_lam_viec');
  },

  fireEmp: async ({ma_nv, ngay_kt}) => {
    const db = await pool;
    const query = `
      UPDATE LICH_SU_LAM_VIEC
      SET thoi_gian_ket_thuc = @ngay_kt
      WHERE ma_nv = @ma_nv AND thoi_gian_ket_thuc IS NULL
    `
    await db.request()
            .input('ma_nv', ma_nv)
            .input('ngay_kt', ngay_kt)
            .query(query);
  }

}