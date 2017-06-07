var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var path = require('path');
var chaosConfig = require('../../config/chaosconfig');

router.route("/check")

.get(function(req, res, next) {
    jwt.verify(req.query.token, chaosConfig.getRecoverySecret(), function(err, decoded) {
        if (err) {
            res.sendFile(path.join(__dirname, '../../views/reset-password', 'error.html'));
        } else {
            res.sendFile(path.join(__dirname, '../../views/reset-password', 'new_password.html'));
        }
    });
});

module.exports = router;