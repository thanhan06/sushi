const express = require("express");
const router = express.Router();
const isAuthenticated = require('../auth/passport');
const author = require('../auth/authorization')
const loginController = require("../controllers/access.controller");

router.post("/register", 
  loginController.register
);

router.post("/login", 
  loginController.login
);
router.patch("/update-customerProfile",isAuthenticated,author(['kh']),loginController.updateCustomerProfile);
router.patch("/update-customerPassword",isAuthenticated,author(['kh']),loginController.upadteCustomerPassword);
module.exports = router;