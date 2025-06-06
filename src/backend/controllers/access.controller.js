const accountService = require("../services/access.service");
const profileService = require("../services/profile.service");
const JWT = require("../auth/JWT");

module.exports = {
  register: async (req, res) => {
    const { username, password, fullname, phone, address } = req.body;

    await accountService.createCustomerAccount(username, password);

    const { ma_tk } = await accountService.getAccountByUsername(username);

    await profileService.createCustomerProfile(ma_tk, fullname, phone, address);

    res.status(201).send({ message: "Register successfully." });
  },

  login: async (req, res) => {
    const { username, password } = req.body;

    const account = await accountService.getAccountByUsername(username);
    if (!account)
      return res.status(401).send({ message: "Invalid username or password." });

    if (account.mat_khau !== password)
      return res.status(401).send({ message: "Invalid username or password." });

    const profile = await (async () => {
      if (account.vai_tro === "kh")
        return await profileService.getCustomerProfile(account.ma_tk);
      else if (account.vai_tro === "nv")
        return await profileService.getEmployeeProfile(null, account.ma_tk);
    })();

    const token = JWT.generateToken(account.ma_tk);
    res.status(200).send({ token, role: account.vai_tro, profile });
  },

  updateCustomerProfile: async (req,res) => {
    const ma_tk=req.user.profile.ma_tk;
    const { ho_ten,dia_chi }=req.body;
    await profileService.updateCustomerProfile(ma_tk,ho_ten,dia_chi);
    res.status(201).json({
      message:"Ok"
    })
  },

  upadteCustomerPassword: async (req,res) => {
    const ma_tk=req.user.profile.ma_tk;
    const { mk_hien_tai,mk_moi }=req.body;
    await profileService.updateCustomerPassword(ma_tk,mk_hien_tai,mk_moi);
    res.status(201).json({
      message:"Ok"
    })
  }
};
