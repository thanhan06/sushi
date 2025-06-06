const express = require('express');
const router = express.Router();

const isAuthenticated = require('../auth/passport');
const author = require('../auth/authorization');

const statisticsController = require('../controllers/statistics.controller');

router.get(
  '/most-order-dishes', 
  isAuthenticated,
  author(['admin']),

  statisticsController.getMostSoldDishes
);

router.get(
  '/dishes-revenue',
  isAuthenticated,
  author(['admin']),

  statisticsController.getDishesRevenue
);

router.get(
  '/num-bills', 
  isAuthenticated,
  author(['admin']),

  statisticsController.getNumBills
);

router.get(
  '/area-revenue', 
  isAuthenticated,
  author(['admin']),

  statisticsController.getAreaRevenue
);

router.get(
  '/branch-revenue', 
  isAuthenticated,
  author(['admin']),

  statisticsController.getBranchRevenue
);

router.get(
  '/avg-reviews', 
  isAuthenticated,
  author(['admin']),

  statisticsController.getAvgReviews
);

module.exports = router;