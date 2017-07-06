var express = require('express');
var path = require('path');
var router = express.Router();

router.use('/', require('./list'));
router.use('/', require('./create'));
router.use('/', require('./movestudent'));
router.use('/', require('./get'));
router.use('/', require('./reset'));


module.exports = router;