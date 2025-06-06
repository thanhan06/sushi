const express = require('express');
const router = express.Router();

const isAuthenticated = require('../auth/passport');
const author = require('../auth/authorization')

const employeeController = require('../controllers/employee.controller');
const cardController=require('../controllers/card.controller')
router.post(
  '/',
  isAuthenticated,
  author(['nv']),

  employeeController.createCard
)
router.get("/",cardController.getCards);
module.exports = router;