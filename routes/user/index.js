var express = require('express');
var path = require('path');
var router = express.Router();

router.use('/', require('./update'));
router.use('/', require('./get'));
router.use('/', require('./search'));
router.use('/', require('./uploadprofilepicture'));


module.exports = router;