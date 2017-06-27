var mongoose = require("mongoose");

var taskSchema = new mongoose.Schema({
		Title: {
			type: String,
			required: true
		},
		Content: {
			type: String,
			required: true
		},
		Group: {
			type: mongoose.Schema.ObjectId,
			ref: 'Groups',
			unique: true
		},
		Class: {
			type: mongoose.Schema.ObjectId,
			ref: 'Classes',
			unique: true
		}
	}, {
	  timestamps: true,
	  autoIndex: false
	}
);
var taskModelSchema = mongoose.model('Tasks', taskSchema, 'Tasks');

module.exports = {
	Tasks: taskModelSchema
}