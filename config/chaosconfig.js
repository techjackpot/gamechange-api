var fs = require('fs');

var chaosConfig = {};

chaosConfig.getURL = function() {
	return (process.env.URL === undefined) ? "https://localhost" : process.env.URL;
}

chaosConfig.getBucketURL = function() {
	return (process.env.BucketURL === undefined) ? "image-bastard-server" : process.env.BucketURL;
}

chaosConfig.getMongoURL = function() {
	return (process.env.MongoURL === undefined) ? "localhost:27017" : process.env.MongoURL;
}

chaosConfig.getPasswordSecret = function() {
	return (process.env.PasswordSecret === undefined) ? "thisisadevsecret" : process.env.PasswordSecret;
}

chaosConfig.getRecoverySecret = function() {
	return (process.env.RecoverySecret === undefined) ? chaosConfig.getPasswordSecret() : process.env.RecoverySecret;
}

chaosConfig.getConfirmationSecret = function() {
	return (process.env.ConfirmationSecret === undefined) ? chaosConfig.getPasswordSecret() : process.env.ConfirmationSecret;
}

chaosConfig.getExpireTime = function() {
	return (process.env.ExpireTime === undefined) ? "60m" : process.env.ExpireTime;
}

chaosConfig.getRecoveryTimeout = function() {
	return (process.env.RecoveryExpireTime === undefined) ? "15m" : process.env.RecoveryExpireTime;
}

chaosConfig.getConfirmationTimeout = function() {
	return (process.env.ConfirmationExpireTime === undefined) ? "1000000h" : process.env.ConfirmationExpireTime;
}

chaosConfig.getEmailSMTP = function() {
	return (process.env.SMTPAddress === undefined) ? "localhost" : process.env.SMTPAddress;
}

chaosConfig.getEmailFrom = function() {
	return (process.env.EmailFrom === undefined) ? '"Epiphany Games" <' + "localhost" + '>' : process.env.EmailFrom;
}

chaosConfig.getEmailUser = function() {
	return (process.env.EmailUser === undefined) ? 'test@test.com' : process.env.EmailUser;
}

chaosConfig.getEmailPassword = function() {
	return (process.env.EmailPassword === undefined) ? "localhost" : process.env.EmailPassword;
}

chaosConfig.getEmailPort = function() {
	return (process.env.EmailPort === undefined) ? 25 : process.env.EmailPort;
}

chaosConfig.getConfirmEmail = function() {
	return (process.env.ConfirmEmail === undefined) ? 'false' : process.env.ConfirmEmail;
}

chaosConfig.smtpConfig = {
	host: chaosConfig.getEmailSMTP(),
	port: chaosConfig.getEmailPort(),
	secure: true,
	auth: {
		user: chaosConfig.getEmailUser(),
		pass: chaosConfig.getEmailPassword()
	}
};

chaosConfig.generateRecoveryLink = function(token) {
	return chaosConfig.getURL() + '/api/forgotpassword/check?token=' + token;
};


chaosConfig.getEmailOptions = function(client, token, callback) {

	fs.readFile('./views/reset-password-email.html', function(err, html) {
		if (err) {
			return callback(err);
		}

		var replacementHTML = html.toString();
		replacementHTML = replacementHTML.replace(/RESETPASSLINK/g, chaosConfig.generateRecoveryLink(token));

		var mailOptions = {
			from: chaosConfig.getEmailFrom(),
			to: client,
			subject: 'Password Recovery',
			text: 'To reset your password follow this link: ' + chaosConfig.generateRecoveryLink(token) + ' \n This link will expire in ' + chaosConfig.getRecoveryTimeout(), // We should abstract this out so we can change the url of it if need be.
			html: replacementHTML
		}

		return callback(null, mailOptions);
	});
}

chaosConfig.getChaosNotificationServer = function() {
	return (process.env.ChaosPushServer === undefined) ? "localhost:81" : process.env.ChaosPushServer;
}

chaosConfig.getAWSRegion = function() {
	return (process.env.AWSRegion === undefined) ? "ap-southeast-2" : process.env.AWSRegion;
};



/*
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY


*/

module.exports = chaosConfig;