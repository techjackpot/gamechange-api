var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../../additional-code/helperfunctions');
var OwnedBackgrounds = require('../../../model/marketitems/marketitem.model').OwnedBackgrounds;
var router = express.Router();
var debug = require('debug')('titlecreate');
var ERR_CODE = require('../../../error_codes');



router.route("/buy")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {

				var ownedBackground = new OwnedBackgrounds();

				ownedBackground.Student = req.body.Student;
				ownedBackground.Background = req.body.Background;
				ownedBackground.save(function(err, doc) {
					if (err) {
						return callback(err);
					}
					callback(null, doc);
				});
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.OwnedBackground = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;