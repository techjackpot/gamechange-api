var express = require('express');
var jwt = require('jsonwebtoken');
var debug = require('debug')('verifytoken');
var async = require('async');
var chaosConfig = require('../../config/chaosconfig');
var router = express.Router();
var ERR_CODE = require('../../error_codes');

router.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-chaos-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, chaosConfig.getPasswordSecret(), function(err, decoded) {
      if (err) {
        return res.status(200).send({
          ERR_CODE: ERR_CODE.TOKEN_ERROR,
          Message: 'Failed to authenticate token.',

        });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    // TODO: CHANGE THIS TO A 200 AND CREATE THAT ERROR FUNCTION FFS
    return res.status(200).send({
      ERR_CODE: ERR_CODE.AUTHTOKEN_MISSING,
      Message: "No token was provided in the header/body/query"
    });

  }
});

module.exports = router;