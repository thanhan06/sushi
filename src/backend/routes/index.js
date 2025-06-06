const express = require("express");
const router = express.Router();


router.use('/', require('./public.route'));

router.use('/access', require('./access.route'));
router.use('/branches', require('./branch.route'));
router.use('/dishes', require('./dish.route'));
router.use('/cards', require('./card.route'));
router.use('/orders',require('./orders.route'));
router.use('/ordersOnline',require('./ordersOnline.route'));
router.use('/ordersDetail',require('./ordersDetail.route'));
router.use('/bills',require('./bill.route'));
router.use('/employees', require('./employee.route'));
router.use('/statistics', require('./statistics.route'));
module.exports = router;