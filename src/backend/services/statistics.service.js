const { pool, sql } = require('../models');


module.exports = {
  
  getMostSoldDishes: async ({limit, chi_nhanh, kv, from, to}) => {
    const db = await pool;
    const { recordset } = await db.request()
      .input('top', limit || 100)
      .input('chi_nhanh', chi_nhanh)
      .input('khu_vuc', kv)
      .input('tu_ngay', from || '1970-1-1')
      .input('den_ngay', to || new Date())
      .execute('usp_xem_mon_ban_nhieu_nhat');
    return recordset;    
  },

  getDishesRevenue: async ({limit, mon_an, chi_nhanh, kv, from, to}) => {
    const db = await pool;
    const { recordset } = await db.request()
      .input('top', limit || 100)
      .input('mon_an', mon_an)
      .input('chi_nhanh', chi_nhanh)
      .input('khu_vuc', kv)
      .input('tu_ngay', from || '1970-1-1')
      .input('den_ngay', to || new Date())
      .execute('usp_xem_doanh_thu_mon_an');
    return recordset;
  },

  getNumBills: async ({chi_nhanh, kv, from, to}) => {
    const db = await pool;
    const { recordset } = await db.request()
      .input('chi_nhanh', chi_nhanh)
      .input('khu_vuc', kv)
      .input('tu_ngay', from || '1970-1-1')
      .input('den_ngay', to || new Date())
      .execute('usp_xem_so_luot_khach_hang');
    return recordset;
  },

  getAreaRevenue: async ({kv, from, to}) => {
    const db = await pool;
    const { recordset } = await db.request()
      .input('ten_kv', kv)
      .input('ngay_bat_dau', from || '1970-1-1')
      .input('ngay_ket_thuc', to || new Date())
      .execute('usp_BaoCaoDoanhThuKhuVuc');
    return recordset;
  },

  getBranchRevenue: async ({chi_nhanh, from, to}) => {
    const db = await pool;
    const { recordset } = await db.request()
      .input('ma_chi_nhanh', chi_nhanh)
      .input('ngay_bat_dau', from || '1970-1-1')
      .input('ngay_ket_thuc', to || new Date())
      .execute('usp_BaoCaoDoanhThuChiNhanh');
    return recordset;
  },

  getAvgReviews: async ({chi_nhanh, khu_vuc, from, to}) => {
    const db = await pool;
    const { recordset } = await db.request()
      .input('ma_chi_nhanh', chi_nhanh)
      .input('khu_vuc', khu_vuc)
      .input('ngay_bat_dau', from || '1970-1-1')
      .input('ngay_ket_thuc', to || new Date())
      .execute('usp_XemDanhGia');
    return recordset;
  }
}