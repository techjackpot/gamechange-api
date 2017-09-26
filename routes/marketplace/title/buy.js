var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../../additional-code/helperfunctions');
var OwnedTitles = require('../../../model/marketitems/marketitem.model').OwnedTitles;
var router = express.Router();
var debug = require('debug')('titlecreate');
var ERR_CODE = require('../../../error_codes');



router.route("/buy")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {

				var ownedTitle = new OwnedTitles();

				ownedTitle.Student = req.body.Student;
				ownedTitle.Title = req.body.Title;
				ownedTitle.save(function(err, doc) {
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
				JSONresponse.OwnedTitle = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;