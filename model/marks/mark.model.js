var mongoose = require("mongoose");

var marktypeSchema = new mongoose.Schema({
		Name: {
			type: String,
			required: true
		},
		Description: {
			type: String,
			default: ''
		},
		Multiplier: {
			type: Number,
			default: 1.5
		},
		Weeks: {
			type: Number,
			default: 3
		},
		MinValue: {
			type: Number,
			default: 5
		},
		ForGroup: {
			type: Boolean,
			default: false
		},
		ForRollCall: {
			type: Boolean,
			default: false
		},
		Class: {
			type: mongoose.Schema.ObjectId,
			ref: 'Classes'
		}
	}, {
	  timestamps: true,
	  autoIndex: false
	}
);
var marktypeModelSchema = mongoose.model('MarkTypes', marktypeSchema, 'MarkTypes');

var markhistorySchema = new mongoose.Schema({
		Class: {
			type: mongoose.Schema.ObjectId,
			ref: 'Classes'
		},
		Staff: {
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		},
		Student: {
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		},
		Attendance: {
			type: Boolean,
			default: false
		},
		Explained: {
			type: Boolean,
			default: false
		},
		Week: {
			type: Number,
			default: 0
		},
		Date: {
			type: String,
			default: ''
		},
		Note: {
			type: String,
			default: ''
		},
		Marks: [{
			MarkType: {
				type: mongoose.Schema.ObjectId,
				ref: 'MarkTypes'
			},
			Value: {
				type: Number,
				default: 0
			}
		}]
	}, {
	  timestamps: true,
	  autoIndex: false
	}
);
var markhistoryModelSchema = mongoose.model('MarkHistory', markhistorySchema, 'MarkHistory');


module.exports = {
	MarkTypes: marktypeModelSchema,
	MarkHistory: markhistoryModelSchema
}