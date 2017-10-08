var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Units = require('../../model/units/unit.model').Units;
var router = express.Router();
var debug = require('debug')('tasks');
var ERR_CODE = require('../../error_codes');



router.route("/update")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				Units.findOne({_id: req.body._id}).exec((err, unit) => {
					if(err) {
						callback(err);
					}
					unit.Name = req.body.Name;
					unit.Description = req.body.Description;
					unit.save(function(err, doc) {
						if (err) {
							return callback(err);
						}
						callback(null, doc);
					});
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