var express = require('express');
var path = require('path');
var router = express.Router();

router.use('/', require('./list'));
router.use('/', require('./create'));
router.use('/', require('./delete'));
router.use('/', require('./update'));
// router.use('/', require('./get'));

module.exports = router;