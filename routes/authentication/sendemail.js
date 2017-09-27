var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var debug = require('debug')('connect');
var chaosConfig = require('../../config/chaosconfig');
var router = express.Router();
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var ERR_CODE = require('../../error_codes');
var nodemailer = require('nodemailer');

router.route("/sendemail")

.post(function(req, res, next) {
	async.waterfall([

			function(callback) {

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
		        to: req.body.Email, // list of receivers
		        subject: 'GameChange: Your registration information', // Subject line
		        html: `
		        	<h1>Your account has been registered at GameChange.</h1>
		        	Here is your login credentials.<br/>
		        	Email: ${req.body.Email}<br/>
		        	Password: ${req.body.Password}
		        ` // html body
		    };

		    // send mail with defined transport object
		    transporter.sendMail(mailOptions, (error, info) => {
		        if (error) {
		            return callback(error);
		        }
		        // console.log('Message sent: %s', info.messageId);
		        // // Preview only available when sending through an Ethereal account
		        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

		        callback();
		        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
		        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
		    });
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
            var JSONresponse = ComposedResponse.response;

            JSONresponse.err = err;
			if (!err) {
				JSONresponse.Message = 'Successfully sent';
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;