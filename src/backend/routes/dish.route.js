const express = require("express");
const router = express.Router();
const isAuthenticated = require('../auth/passport');
const author = require('../auth/authorization')
const dishController = require("../controllers/dish.controller");

router.get("/", dishController.getDishes);
router.get("/types", dishController.getDishTypes);
router.get("/:id", dishController.getDish);
router.delete("/:dishId/:area",isAuthenticated,author(['admin']),dishController.deleDishArea);
router.post("/",isAuthenticated,author(['admin']),dishController.addDishNotService);
router.patch("/:dishId",isAuthenticated,author(['admin']),dishController.updateDish);
router.post("/add",isAuthenticated,author(['admin']),dishController.addDish)
module.exports = router;

