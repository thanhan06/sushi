const express = require("express");
const router = express.Router();
const isAuthenticated = require('../auth/passport');
const author = require('../auth/authorization')
const employeeController = require("../controllers/employee.controller");

router.get("/",isAuthenticated,author(['admin']),employeeController.getBills);
router.post("/:ma_phieu",isAuthenticated,author(['nv']),employeeController.postBills);
router.post("/review-bills/:ma_phieu",isAuthenticated,author(['nv']),employeeController.reviewBills);
router.delete("/:ma_phieu",isAuthenticated,author(['nv']),employeeController.deleteBills);

module.exports=router;