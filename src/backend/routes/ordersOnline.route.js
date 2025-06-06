const express = require("express");
const router = express.Router();
const isAuthenticated = require('../auth/passport');
const author = require('../auth/authorization')
const employeeController = require("../controllers/employee.controller");
const cusController=require("../controllers/customer.controller");

router.get("/",isAuthenticated,author(['nv']),employeeController.getOrdersOnline);
router.get("/get-cusOrderOnlines",isAuthenticated,author(['kh']),cusController.getCusordersOnline);
router.post("/",isAuthenticated,author(['kh']),cusController.postOrdersOnline);

// router.post("/",cusController.postOrdersOnline);
// router.delete("/:ma_dh",isAuthenticated,author(['nv']),employeeController.deleteOrders);
module.exports=router;