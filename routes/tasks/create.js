var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var helper = require('../../additional-code/helperfunctions');
var Classes = require('../../model/classes/class.model').Classes;
var Groups = require('../../model/classes/class.model').Groups;
var Tasks = require('../../model/tasks/task.model').Tasks;
var router = express.Router();
var debug = require('debug')('classes');
var ERR_CODE = require('../../error_codes');



router.route("/create")

.post(function(req, res, next) {
	async.waterfall([
			function(callback) {
				var newTask = new Tasks();
				newTask.Title = req.body.Title;
				newTask.Content = req.body.Content;
				newTask.Group = req.body.Group;
				newTask.Class = req.body.Class;
				newTask.save(function(err, doc) {
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
				JSONresponse.Task = result;
			}

			res.status(StatusCode).json(JSONresponse);

			//helper.SendStandardJSON(res, err, result);
		});
});

module.exports = router;