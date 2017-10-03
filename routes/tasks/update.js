var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Tasks = require('../../model/tasks/task.model').Tasks;
var router = express.Router();
var debug = require('debug')('tasks');
var ERR_CODE = require('../../error_codes');



router.route("/update")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				Tasks.findOne({_id: req.body._id}).exec((err, task) => {
					if(err) {
						callback(err);
					}
					task.Title = req.body.Title;
					task.Content = req.body.Content;
					task.Group = req.body.Group;
					task.Class = req.body.Class;
					task.save(function(err, doc) {
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
				JSONresponse.Task = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;