const branchService = require("../services/branch.service");


module.exports = {

  getAreas: async (req, res) => {
    const areas = await branchService.getAreas();
    res.status(200).json(areas);
  },

  getBranches: async (req, res) => {
    const { area } = req.query;
    const branches = await branchService.getBranches({area});
    res.status(200).json(branches);
  }

}