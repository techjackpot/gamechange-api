var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Units = require('../../model/units/unit.model').Units;
var router = express.Router();
var debug = require('debug')('units');
var ERR_CODE = require('../../error_codes');



router.route("/create")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				var newUnit = new Units();
				newUnit.Name = req.body.Name;
				newUnit.Description = req.body.Description;
				newUnit.save(function(err, doc) {
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
				JSONresponse.Unit = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;