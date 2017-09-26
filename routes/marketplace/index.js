var express = require('express');
var path = require('path');
var router = express.Router();

router.use('/titles/', require('./title/list'));
router.use('/titles/', require('./title/create'));
router.use('/titles/', require('./title/delete'));
router.use('/titles/', require('./title/buy'));
router.use('/titles/', require('./title/my'));


router.use('/backgrounds/', require('./background/list'));
router.use('/backgrounds/', require('./background/create'));
router.use('/backgrounds/', require('./background/delete'));
router.use('/backgrounds/', require('./background/buy'));
router.use('/backgrounds/', require('./background/my'));

module.exports = router;