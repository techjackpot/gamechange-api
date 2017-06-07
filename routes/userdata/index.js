var express = require('express');
var path = require('path');
var router = express.Router();

router.use('/', require('./push'));
router.use('/', require('./get'));


module.exports = router;