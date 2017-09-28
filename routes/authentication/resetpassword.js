var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var debug = require('debug')('connect');
var chaosConfig = require('../../config/chaosconfig');
var requireDir = require('require-dir');
var mongoDB = require('../../mongo');
var User = require('../../model/user.model').User;
var PassportsDir = requireDir('../../model/passportdefinitions');
var PassportType = require('../../model/passporttypes/passporttype.model').PassportType;
var router = express.Router();
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var JWT_EXPIRE_TIME = '30m';
var ERR_CODE = require('../../error_codes');
var emailConfirmation = require('../../libs/emailconfirmation');
var nodemailer = require('nodemailer');
var EmailPassport = require('../../model/passportdefinitions/emailpassport.model').EmailPassport;

function randomPassword(keyLength) {
  let i, key = "", characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", lowers = "abcdefghijklmnopqrstuvwxyz", uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", nums = "01234567890";


  let charactersLength = characters.length;

  key += lowers.substr(Math.floor((Math.random() * lowers.length) + 1), 1);
  key += uppers.substr(Math.floor((Math.random() * uppers.length) + 1), 1);
  key += nums.substr(Math.floor((Math.random() * nums.length) + 1), 1);

  for (i = 0; i < keyLength; i++) {
    key += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
  }

  return key;
}



router.route("/resetpassword")

.post(function(req, res, next) {
  async.waterfall([

      function(callback) {
        console.log(req.decoded);

        EmailPassport.findOne({UserId: req.decoded.UserId}).exec(function (err, doc) {
          if (err) {
            var errString = "Something bad happened";
            var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
            debug(errString);
            callback(errObject);
          } 
          if (doc) {
            return callback(null, doc);
          }
        });
      }, function(passport, callback) {
        // console.log(passport);
        var newPassword = randomPassword(15);
        console.log(newPassword);
        passport.Password = newPassword;
        passport.save(function(err, doc) {
          if(err) {
            callback(err);
          }

          let transporter = nodemailer.createTransport({
              host: 'in-v3.mailjet.com',
              port: 587,
              secure: false, // true for 465, false for other ports
              auth: {
                  user: 'e62cb5c01ed7f6df9be1aaeb2eaaff74', // generated ethereal user
                  pass: '726715233640aa60f288530c99f5f24f'  // generated ethereal password
              }
          });

          // setup email data with unicode symbols
          let mailOptions = {
              from: '"GameChange" <jackofalltrades117@outlook.com>', // sender address
              to: passport.Email, // list of receivers
              subject: 'GameChange: Your account information', // Subject line
              html: `
                <h1>Your account password has been reset.</h1>
                Here is your login credentials.<br/>
                Email: ${passport.Email}<br/>
                Password: ${newPassword}
              ` // html body
          };

          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return callback(error);
              }
              callback();
          });
          // callback(null, doc);
        })
      }
    ],
    function(err, result) {
      var ComposedResponse = helper.ComposeJSONResponse(err);
      var StatusCode = ComposedResponse.code;
            var JSONresponse = ComposedResponse.response;

            JSONresponse.err = err;
      if (!err) {
        JSONresponse.Message = 'Successfully reset';
      }

      res.status(StatusCode).json(JSONresponse);

      //helper.SendStandardJSON(res, err, result);
    });
});

module.exports = router;