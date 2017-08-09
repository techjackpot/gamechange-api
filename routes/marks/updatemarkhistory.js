var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var MarkHistory = require('../../model/marks/mark.model').MarkHistory;
var router = express.Router();
var debug = require('debug')('MarkHistory');
var ERR_CODE = require('../../error_codes');



router.route("/updatemarkhistory")

.post(function(req, res, next) {
	const { data } = req.body;
	async.waterfall([
			function(callback) {
				let result = [];
				let p =new Promise((resolve, reject) => {
					data.forEach((markhistory) => {
						if(!markhistory._id) {
							let history = new MarkHistory();
							for(var key in markhistory) {
								history[key] = markhistory[key];
							}
							history.save(function(err, doc) {
								result.push(doc);
								if(result.length == data.length) {
									resolve();
								}
							});
						} else {
							MarkHistory.findOne({_id: markhistory._id}).exec((err, history) => {
								for(var key in markhistory) {
									if(key == '_id') continue;
									history[key] = markhistory[key];
								}
								history.save(function(err, doc) {
									result.push(doc);
									if(result.length == req.body.length) {
										resolve();
									}
								});
							})
						}
					});
				});
				p.then(() =>{
					callback(null, result)
				});
				// MarkHistory.findOne({ _id: req.body._id }).exec(function (err, doc) {
				// 	if (err || !doc) {
				// 		var errString = "Something bad happened";
				// 		var errObject = helper.constructErrorResponse(ERR_CODE.UNKNOWN, errString, 500);
				// 		debug(errString);
				// 		return callback(errObject);
				// 	} else {
				// 		return callback(null, doc);
				// 	}
				// });
			},
			// function(classInfo, callback) {
			// 	for(var key in req.body) {
			// 		if(key == '_id') continue;
			// 		classInfo[key] = req.body[key];
			// 	}
			// 	classInfo.save(function(err, doc) {
	  //       if (err)
	  //         return callback(err);
	  //       return callback(null, doc);
   //      });
			// }
		],
		function(err, result) {
			var ComposedResponse = helper.ComposeJSONResponse(err);
			var StatusCode = ComposedResponse.code;
			var JSONresponse = ComposedResponse.response;

			JSONresponse.err = err;
			if (!err) {
				JSONresponse.MarkHistory = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;