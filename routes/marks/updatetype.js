var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var MarkTypes = require('../../model/marks/mark.model').MarkTypes;
var router = express.Router();
var debug = require('debug')('marktype');
var ERR_CODE = require('../../error_codes');



router.route("/updatetype")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				MarkTypes.findOne({_id: req.body._id}).exec((err, marktype) => {
					if(err) {
						callback(err);
					}
					marktype.Name = req.body.Name;
					marktype.Description = req.body.Description;
					marktype.Multiplier = req.body.Multiplier;
					marktype.Weeks = req.body.Weeks;
					marktype.MinValue = req.body.MinValue;
					marktype.ForGroup = req.body.ForGroup;
					marktype.ForRollCall = req.body.ForRollCall;
					// marktype.Class = req.body.Class;
					marktype.save(function(err, doc) {
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
				JSONresponse.MarkType = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;