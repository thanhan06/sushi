const { pool } = require('../models');

module.exports = {
  getCustomerProfile: async (userId) => {
    const db = await pool;
    const query = `
      SELECT *
      FROM TT_KHACH_HANG
      WHERE ma_tk = @ma_tk
    `;
    const { recordset } = await db.request().input('ma_tk', userId).query(query);

    return recordset[0];
  },

  getEmployeeProfile: async (employeeId, accountId) => {
    const db = await pool;
    const query = `
      SELECT *
      FROM NHAN_VIEN
      WHERE ma_nv = @ma_nv
      OR ma_tk = @ma_tk
    `;
    const { recordset } = await db.request().input('ma_nv', employeeId).input('ma_tk', accountId).query(query);

    return recordset[0];
  },

  createCustomerProfile: async (userId, fullname, phone, address) => {
    const db = await pool;
    const query = 'INSERT INTO TT_KHACH_HANG (ma_tk, ho_ten, sdt, dia_chi) VALUES (@ma_tk, @ho_ten, @dien_thoai, @dia_chi)'

    await db.request()
            .input('ma_tk', userId)
            .input('ho_ten', fullname)
            .input('dien_thoai', phone)
            .input('dia_chi', address)
            .query(query);
  },

  updateCustomerProfile: async (ma_tk, ho_ten, dia_chi) => {
    const db = await pool;
    let query = "UPDATE TT_KHACH_HANG SET ";
    if (ho_ten) {
      query += "ho_ten = @ho_ten";
    }
    if (dia_chi) {
      query += (ho_ten ? ", " : "") + "dia_chi = @dia_chi"; 
    }
    query += " WHERE ma_tk = @ma_tk"; 
    const request = db.request().input("ma_tk", ma_tk);
    if (ho_ten) request.input("ho_ten", ho_ten);
    if (dia_chi) request.input("dia_chi", dia_chi);
    await request.query(query);
  },
  updateCustomerPassword: async (ma_tk,mk_hien_tai,mk_moi) => {
    const db = await pool;
    const querySelect='SELECT mat_khau FROM TAI_KHOAN WHERE ma_tk=@ma_tk'
    const result = await db.request()
                         .input('ma_tk', ma_tk)
                         .query(querySelect);
    if(mk_hien_tai!=result.recordset[0].mat_khau) {
      throw new Error("Mật khẩu hiện tại không đúng!");
    }
    const queryUpdate = `UPDATE TAI_KHOAN SET mat_khau = @mk_moi WHERE ma_tk = @ma_tk`;
    await db.request()
          .input('ma_tk', ma_tk)
          .input('mk_moi', mk_moi)
          .query(queryUpdate);

  }
  
}