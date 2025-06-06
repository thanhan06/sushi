const express = require('express');
const router = express.Router();

const isAuthenticated = require('../auth/passport');
const author = require('../auth/authorization');
const employeeController = require('../controllers/employee.controller');

router.post(
  '/',
  isAuthenticated,
  author(['admin']),

  employeeController.addEmp
)

router.post(
  '/history',
  isAuthenticated,
  author(['admin']),
  
  employeeController.relocateEmp
)

router.get(
  '/',
  isAuthenticated,
  author(['admin']),

  employeeController.getWorkingEmp
)

router.patch(
  '/:ma_nv',
  isAuthenticated,
  author(['admin']),

  employeeController.fireEmp
)

module.exports = router;  