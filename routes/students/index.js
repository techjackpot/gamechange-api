var express = require('express');
var path = require('path');
var router = express.Router();

router.use('/', require('./get'));
router.use('/', require('./getclass'));
router.use('/', require('./getgroup'));
router.use('/', require('./gettask'));
router.use('/', require('./getfriend'));
router.use('/', require('./sendfriendrequest'));
router.use('/', require('./acceptrequest'));
router.use('/', require('./removefriend'));
router.use('/', require('./buildfriendconnection'));

module.exports = router;