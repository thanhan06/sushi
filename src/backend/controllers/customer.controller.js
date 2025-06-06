const cusService = require("../services/cus.service");
module.exports= {
    postOrdersOnline: async (req,res) => {
        const ma_tk=req.user.profile.ma_tk;
        const { sdt,ma_chi_nhanh,loai_dat,dia_chi,ngay_giao,ds_mon_an } =req.body;
        
        await cusService.postOrdersOnline ({ma_tk,sdt,ma_chi_nhanh,loai_dat,dia_chi,ngay_giao,ds_mon_an});
        return res.status(201).json({
            message: "OK"
            
        })
    },

    getCusordersOnline: async (req,res) => {
        const ma_tk=req.user.profile.ma_tk;
        const data=await cusService.getCusordersOnline(ma_tk);
        return res.status(201).json({
            message:"Ok",
            data:data
        })
    }
}