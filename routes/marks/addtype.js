var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var MarkTypes = require('../../model/marks/mark.model').MarkTypes;
var router = express.Router();
var debug = require('debug')('marktype');
var ERR_CODE = require('../../error_codes');



router.route("/addtype")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				var newMarkType = new MarkTypes();
				newMarkType.Name = req.body.Name;
				newMarkType.Description = req.body.Description;
				newMarkType.Multiplier = req.body.Multiplier;
				newMarkType.Weeks = req.body.Weeks;
				newMarkType.MinValue = req.body.MinValue;
				newMarkType.Class = req.body.Class;
				newMarkType.ForGroup = req.body.ForGroup;
				newMarkType.save(function(err, doc) {
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
				JSONresponse.MarkType = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;