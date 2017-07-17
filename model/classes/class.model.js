var mongoose = require("mongoose");

var groupSchema = new mongoose.Schema({
		Title: {
			type: String,
			required: true
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
var groupModelSchema = mongoose.model('Groups', groupSchema, 'Groups');

var groupstudentSchema = new mongoose.Schema({
		Group: {
			type: mongoose.Schema.ObjectId,
			ref: 'Groups'
		},
		Class: {
			type: mongoose.Schema.ObjectId,
			ref: 'Classes'
		},
		Student: {
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		}
	}, {
      timestamps: true
  }
);
var groupstudentModelSchema = mongoose.model('GroupStudents', groupstudentSchema, 'GroupStudents');

var classSchema = new mongoose.Schema({
		Name: {
			type: String,
			required: true,
			unique: true,
			index: true
		},
		Description: {
			type: String,
			default: ''
		},
		Teachers: [{
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		}],
		Students: [{
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		}],
		Groups: [{
			type: mongoose.Schema.ObjectId,
			ref: 'Groups'
		}],
		Tasks: [{
			type: mongoose.Schema.ObjectId,
			ref: 'Tasks'
		}],
		DateTime: {
			type: String,
			default: ''
		},
		TotalWeeks: {
			type: Number,
			default: 0
		},
		Room: {
			type: String,
			default: ''
		},
		Subject: {
			type: String,
			default: ''
		},
	}, {
		timestamps: true
	}
);

var classModelSchema = mongoose.model('Classes', classSchema, 'Classes');

module.exports = {
	Classes: classModelSchema,
	Groups: groupModelSchema,
	GroupStudents: groupstudentModelSchema
}