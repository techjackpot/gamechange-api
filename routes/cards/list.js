var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Cards = require('../../model/cards/card.model').Cards;
var router = express.Router();
var debug = require('debug')('cards');
var ERR_CODE = require('../../error_codes');



router.route("/list")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				//var user_id = req.body.Creator || req.decoded.UserId;
				Cards.find(req.body).populate('Creator').exec(function (err, docs) {
					if (err) {
						var errString = "Something bad happened";
						var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
						debug(errString);
						callback(errObject);
					} else if (docs.length > 0) {
						callback(null, docs);

					} else {

						callback(null, []);
					}
				});
			}
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.Cards = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;