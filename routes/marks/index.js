var express = require('express');
var path = require('path');
var router = express.Router();

router.use('/', require('./gettypes'));
router.use('/', require('./addtype'));
router.use('/', require('./updatetype'));
router.use('/', require('./removetype'));
router.use('/', require('./getmarkhistory'));
router.use('/', require('./updatemarkhistory'));


module.exports = router;