const employeeService = require("../services/employee.service");

module.exports = {
  createCard: async (req, res) => {
    const employeeId = req.user.profile.ma_nv;
    const { hoten, cccd, sdt, email, gioitinh } = req.body;

    await employeeService.createCard(employeeId, {
      hoten,
      cccd,
      sdt,
      email,
      gioitinh,
    });
    res.status(201).json({message: 'Card created'});
  },

  getOrders: async (req,res) => {
    const status=req.query.status;
    const pageSize=10;
    let page=req.query.page
    if(!page){
      page=1;
    }
    else {
      page=req.query.page;
    }
    const data=await employeeService.getOrders(status,page,pageSize);
    res.status(201).json({
      message:'Ok',
      data:data
    }) 
  },

  postOrders: async (req,res) => {
    const employeeId = req.user.profile.ma_nv;
    const { ma_dh,ma_chi_nhanh,ma_ban,ngay_den,ds_mon_an } = req.body;
    await employeeService.postOrders(employeeId,{ ma_dh,ma_chi_nhanh,ma_ban,ngay_den,ds_mon_an });
    res.status(201).json({
      message:"Create order success"
    })
  },

  deleteOrders: async (req,res) => {
    const { ma_phieu }=req.params;
    await employeeService.deleteOrders(ma_phieu);
    res.status(201).json({
      message:"Delete order success"
    })
  },

  postOrdersDetail: async (req, res) => {
    const { ma_phieu }=req.params;
    const{ ma_mon,so_luong }=req.body;
    await employeeService.postOrdersDetail(ma_phieu,ma_mon,so_luong);
    res.status(201).json({
      message:"Create order detail success"
    })
  },

  deleteOrdersDetail: async (req,res) => {
    const { ma_phieu,ma_mon }=req.params;
    await employeeService.deleteOrdersDetail(ma_phieu,ma_mon);
    res.status(201).json({
      message:"Delete order detail success"
    })
  },

  updateOrdersDetail: async (req,res) => {
    const { ma_phieu,ma_mon }=req.params;
    const { so_luong }=req.body;
    await employeeService.updateOrdersDetail(ma_phieu,ma_mon,so_luong);
    res.status(201).json({
      message:"Update order detail success"
    })
  },

  getOrdersOnline: async (req,res) => {
    const status=req.query.status;
    const pageSize=10;
    let page=req.query.page
    if(!page){
      page=1;
    }
    else {
      page=req.query.page;
    }
    const data=await employeeService.getOrdersOnline(status,page,pageSize);
    res.status(201).json({
      message:'Ok',
      data:data
    }) 
  },

  getBills: async (req,res) => {
    const pageSize=10;
    let {ma_the,start,end,page}=req.query;
    if(!page) page=1;
    const data=await employeeService.getBills(ma_the,start,end,page,pageSize);
    res.status(201).json({
      message:'Ok',
      data:data
    }) 
  },
  
  postBills: async (req,res) => {
    const employeeId=req.user.profile.ma_nv;
    const {ma_phieu}=req.params;
    const { sdt }=req.body;
    await employeeService.postBills (ma_phieu,sdt,employeeId);
    res.status(201).json({
      message:'Pay success',
    }) 
  },

  deleteBills: async (req,res) => {
    const { ma_phieu }=req.params;
    await employeeService.deleteBills(ma_phieu);
    res.status(201).json({
      message:'Delete success',
    })
  },

  reviewBills: async (req,res) => {
    const {ma_phieu}=req.params;
    const{diem_vi_tri,diem_phuc_vu,diem_mon_an,diem_gia_ca,diem_khong_gian,binh_luan}=req.body;
    await employeeService.reviewBills(ma_phieu,{ diem_vi_tri,diem_phuc_vu,diem_mon_an,diem_gia_ca,diem_khong_gian,binh_luan });
    res.status(201).json({
      message:'Review succes'
    })
  },

  addEmp: async (req, res) => {
    const {ten_tk, mat_khau, ma_cn, ho_ten, gioi_tinh, sdt, dia_chi, ngay_sinh, ma_bo_phan} = req.body;
    await employeeService.addEmp({
      ten_tk, 
      mat_khau, 
      ma_cn: +ma_cn, 
      ho_ten, 
      gioi_tinh, 
      sdt, 
      dia_chi, 
      ngay_sinh, 
      ma_bo_phan: +ma_bo_phan
    });
    res.status(201).json({
      message:'Add success',
    })
  },

  getWorkingEmp: async (req, res) => {
    const pageSize=10;
    let { ma_cn, ten_kv,page } = req.query;
    if(!page) page=1;
    const data = await employeeService.getWorkingEmployees({
      ma_cn: +ma_cn, 
      ten_kv,
      page,
      pageSize
    });
    res.status(201).json({
      message:'Ok',
      data: data
    });
  },

  relocateEmp: async (req,res) => {
    const { ma_nv, ma_cn, ngay_bd } = req.body;
    await employeeService.relocateEmp({
      ma_nv: +ma_nv, 
      ma_cn: +ma_cn, 
      ngay_bd
    });
    res.status(201).json({
      message:'Relocate success',
    })
  },

  fireEmp: async (req, res) => {
    const { ma_nv } = req.params;
    const { ngay_kt } = req.body;
    await employeeService.fireEmp({
      ma_nv: +ma_nv, 
      ngay_kt
    });
    res.status(201).json({
      message:'Fire success',
    })
  }
};
