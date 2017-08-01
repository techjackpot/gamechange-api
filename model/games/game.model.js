var mongoose = require("mongoose");

var gameSchema = new mongoose.Schema({
		Class: {
			type: mongoose.schema.ObjectId,
			ref: 'Classes'
		}
	}, {
		timestamps: true
	}
);

var gameModelSchema = mongoose.model('Games', gameSchema, 'Games');

module.exports = {
	Games: gameModelSchema
}