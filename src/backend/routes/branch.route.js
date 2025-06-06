const express = require("express");
const branchController = require("../controllers/branch.controller");
const router = express.Router();


router.get("/", branchController.getBranches);
router.get("/area", branchController.getAreas);

module.exports = router;