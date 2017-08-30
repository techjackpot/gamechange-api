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
		Collection: [{
			type: mongoose.Schema.ObjectId,
			ref: 'Cards'
		}],
		PickUp: [{
			type: mongoose.Schema.ObjectId,
			ref: 'Cards'
		}],
		Player_PickupPileSize: {
			type: Number,
			default: 5
		},
		Player_CollectionSize: {
			type: Number,
			default: 0
		},
		Player_StackSize: {
			type: Number,
			default: 10
		},
		Player_HandSize: {
			type: Number,
			default: 5
		},
		Players: [{
			Player: {
				type: mongoose.Schema.ObjectId,
				ref: 'Users'
			},
			Hand: [{
				type: mongoose.Schema.ObjectId,
				ref: 'Cards'
			}],
			Stack: [{
				type: mongoose.Schema.ObjectId,
				ref: 'Cards'
			}],
			Collection: [{
				type: mongoose.Schema.ObjectId,
				ref: 'Cards'
			}],
			Drawn: {
				type: Boolean,
				default: false,
			},
			Gold: {
				type: Number,
				default: 0
			},
			Point: {
				type: Number,
				default: 0
			},
			Defence: {
				type: Number,
				default: 0
			}
		}],
		CardHistory: [{
			Source: {
				type: mongoose.Schema.ObjectId,
				ref: 'Users'
			},
			Target: [
				[{
					type: mongoose.Schema.ObjectId,
					ref: 'Users'
				}]
			],
			TargetLeft: [
				[{
					type: mongoose.Schema.ObjectId,
					ref: 'Users'
				}]
			],
			Card: {
				type: mongoose.Schema.ObjectId,
				ref: 'Cards'
			},
			UnResolved: {
				type: Number,
				default: 0
			},
			Delay: {
				type: Number,
				default: 0
			},
			Repeat: {
				type: Number,
				default: 1
			},
			StartAt: {
				type: Number,
				default: 0
			},
			Week: {
				type: Number,
				default: 1
			}
		}],
		Weeks: {
			type: Number,
			default: 1
		},
		Status: {
			type: String, // Started, Stopped, RollCall
			default: 'Stopped'
		}
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