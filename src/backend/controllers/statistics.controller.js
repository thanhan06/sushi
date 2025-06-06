  const statisticsService = require('../services/statistics.service');

module.exports = {
  getMostSoldDishes: async (req, res) => {
    const { limit, chi_nhanh, kv, from, to } = req.query;
    const data = await statisticsService.getMostSoldDishes({
      limit: +limit, 
      chi_nhanh: +chi_nhanh, 
      kv, 
      from, 
      to
    });
    res.json(data);
  },

  getDishesRevenue: async (req, res) => {
    const { limit, mon_an, chi_nhanh, kv, from, to } = req.query;
    const data = await statisticsService.getDishesRevenue({
      limit: +limit, 
      mon_an: +mon_an,
      chi_nhanh: +chi_nhanh, 
      kv, 
      from, 
      to
    });
    res.json(data);
  },

  getNumBills: async (req, res) => {
    const { chi_nhanh, kv, from, to } = req.query;
    const data = await statisticsService.getNumBills({
      chi_nhanh: +chi_nhanh, 
      kv, 
      from, 
      to
    });
    res.json(data);
  },

  getAreaRevenue: async (req, res) => {
    const { kv, from, to } = req.query;
    const data = await statisticsService.getAreaRevenue({kv, from, to});
    res.json(data);
  },

  getBranchRevenue: async (req, res) => {
    const { chi_nhanh, from, to } = req.query;
    const data = await statisticsService.getBranchRevenue({
      chi_nhanh: +chi_nhanh, 
      from, 
      to
    });
    res.json(data);
  },

  getAvgReviews: async (req, res) => {
    const { chi_nhanh, kv, from, to } = req.query;
    const data = await statisticsService.getAvgReviews({
      chi_nhanh: +chi_nhanh, 
      kv, 
      from, 
      to
    });
    res.json(data);
  },

}