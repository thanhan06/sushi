const express = require("express");
const router = express.Router();
const isAuthenticated = require('../auth/passport');
const author = require('../auth/authorization')
const employeeController = require("../controllers/employee.controller");

// router.get("/",isAuthenticated,author(['nv']),employeeController.getOrders);
router.post("/:ma_phieu",isAuthenticated,author(['nv']),employeeController.postOrdersDetail);
router.delete("/:ma_phieu/:ma_mon",isAuthenticated,author(['nv']),employeeController.deleteOrdersDetail);
router.patch("/:ma_phieu/:ma_mon",isAuthenticated,author(['nv']),employeeController.updateOrdersDetail);
module.exports=router;