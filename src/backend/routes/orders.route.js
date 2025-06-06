const express = require("express");
const router = express.Router();
const isAuthenticated = require('../auth/passport');
const author = require('../auth/authorization')
const employeeController = require("../controllers/employee.controller");

router.get("/",isAuthenticated,author(['nv']),employeeController.getOrders);
router.post("/",isAuthenticated,author(['nv']),employeeController.postOrders);
router.delete("/:ma_phieu",isAuthenticated,author(['nv']),employeeController.deleteOrders);

module.exports=router;