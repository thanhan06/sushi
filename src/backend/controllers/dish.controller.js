const dishService = require('../services/dish.service');

module.exports = {

  getDishTypes: async (req, res) => {
    const dishTypes = await dishService.getAllDishTypes();
    res.status(200).json(
      dishTypes
  );
  },

  getDishes: async (req, res) => {
    const { area, branch, name, type } = req.query;
    const dishes = await dishService.getAllDishes({ area, branch, name, type });
    res.status(200).json(dishes);
  },

  getDish: async (req, res) => {
    const { id } = req.params;
    const dish = await dishService.getDishByDishId(id);
    res.status(200).json(dish);
  },

  deleDishArea: async (req,res) => {
    const { dishId,area }=req.params;
    if (!dishId || !area) {
      return res.status(400).json({
        message: "Missing dishId or area",
      });
    }
    await dishService.deleDishArea(dishId,area);
    return res.status(200).json({
      message:"Ok"
    })
  },

  addDishNotService: async (req,res) => {
    const { dishId,branch }=req.body;
    if (!dishId || !branch) {
      return res.status(400).json({
        message: "Missing dishId or branch",
      });
    }
    await dishService.addDishNotService(dishId,branch);
    return res.status(200).json({
      message:"Ok"
    })
  },

  updateDish: async (req,res) => {
    const { dishId }=req.params;
    const { gia_hien_tai,giao_hang }=req.body;
    await dishService.updateDish(dishId,gia_hien_tai,giao_hang);
    return res.status(200).json({
      message:"Ok"
    })
  },

  addDish: async (req,res) => {
    const { ten_mon,gia,loai,gia_hien_tai,giao_hang}=req.body;
    if (!ten_mon || !gia || !loai || !gia_hien_tai || !giao_hang) {
      return res.status(400).json({
        message: "Missing required parameters: ten_mon, gia, loai, gia_hien_tai, giao_hang",
      });
    }
    await dishService.addDish(ten_mon,gia,loai,gia_hien_tai,giao_hang);
    return res.status(200).json({
      message:"Ok"
    })
  }

}