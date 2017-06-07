var mongoose = require('mongoose');
var chaosConfig = require('../config/chaosconfig');
var method = EmailConfirmation.prototype;
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var async = require('async');
var user = require('../model/user.model').User;
var debug = require('debug');
var fs = require('fs');

function EmailConfirmation() {
	this._confirmApiUrl = chaosConfig.getURL() + "/api/confirmemail"; // TODO: figure out a way to grab this from the route itself
	this._transporter = nodemailer.createTransport(chaosConfig.smtpConfig);
}



method.createEmail = function(User, token, welcomeMessage, callback) {
	var confirmLink = this._confirmApiUrl + "?token=" + token;


	fs.readFile('./views/confirm-email.html', function(err, html) {
		if (err) {
			return callback(err);
		}

		var replacementHTML = html.toString();
		replacementHTML = replacementHTML.replace(/CONFIRMLINK/g, confirmLink);

		if (welcomeMessage)
			replacementHTML = replacementHTML.replace(/WELCOMEMESSAGE/g, welcomeMessage);


		var mailOptions = {
			from: chaosConfig.getEmailFrom(),
			to: User.Email,
			subject: 'Confirmation Email',
			text: 'Please activate your account: ' + confirmLink,
			html: replacementHTML
		}

		return callback(null, mailOptions);
	});
}

method.send = function(User, welcomeMessage, callback) {
	var _this = this;

	jwt.sign({
		UserId: User._id
	}, chaosConfig.getConfirmationSecret(), {
		expiresIn: chaosConfig.getConfirmationTimeout()
	}, function(err, token) {
		if (err || !User._id) {
			debug("Failed to sign token");
			callback("Failed to create token");
		} else {
			debug("Signed token for %s", User._id);
			var result = {};
			result.userID = User._id;
			result.token = token;

			_this.createEmail(User, token, welcomeMessage, function(err, mailOptions) {
				if (err)
					return callback(err);

				_this._transporter.sendMail(mailOptions, function(err, info) {
					if (err) {
						debug(err);
						return callback(err);
					}

					return callback();
				});

			});
		}
	});
};

method.check = function(token, callback) {
	jwt.verify(token, chaosConfig.getConfirmationSecret(), function(err, decoded) {
		if (err)
			return callback(err);


		user.update({
			_id: decoded.UserId
		}, {
			ConfirmedEmail: true
		}).exec(function(err, doc) {

			if (err)
				return callback("database error");

			return callback();
		});
	});
}

var emailConfirmation = new EmailConfirmation()


module.exports = emailConfirmation;