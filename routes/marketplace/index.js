var express = require('express');
var path = require('path');
var router = express.Router();

router.use('/titles/', require('./title/list'));
router.use('/titles/', require('./title/create'));
router.use('/titles/', require('./title/delete'));


router.use('/backgrounds/', require('./background/list'));
router.use('/backgrounds/', require('./background/create'));
router.use('/backgrounds/', require('./background/delete'));

module.exports = router;