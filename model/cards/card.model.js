var mongoose = require("mongoose");

var keywordSchema = new mongoose.Schema({

});

var cardSchema = new mongoose.Schema({
		Title: {
			type: String,
		},
		Description: {
			type: String,
		},
		Picture: {
			type: String,
		},
		Type: {
	    type: String,
	    enum: ["Special", "Common", "Defence", "Offence"],
	    default: 'Common'
		},
		Rarity: {
	    type: String,
	    enum: ["Common", "Uncommon", "Rare"],
	    default: 'Common'
		},
		Creator: {
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		},
		GoldCost: {
			type: Number,
			default: 1
		},
		BackgroundInfo: {
			type: String,
			default: ''
		},
		Actions: [{
			Keyword: {
				type: String,
				enum: ["", "Add Points", "Subtract Points", "Add Gold", "Subtract Gold", "Add Cards", "Subtract Cards", "Defend Negative", "Perform Action", "Persist", "Activation Time", "Add Friend", "Any Mark", "Any Mark Over", "Any Mark Under", "Specific Mark1", "Specific Mark1 Over", "Specific Mark1 Under", "Specific Mark2", "Specific Mark2 Over", "Specific Mark2 Under", "Specific Mark3", "Specific Mark3 Over", "Specific Mark3 Under", "Any Title", "Any Background", "Any Points Value Over", "Any Points Value Under", "Any Gold Value Over", "Any Gold Value Under"],
				default: ''
			},
			Target: {
				type: String,
				enum: ["Self", "Friends", "Others", "Previous", "Highest Mark Player", "Lowest Mark Player", "Highest Gold Player", "Lowest Gold Player", "Highest Points Player", "Lowest Points Player", "Highest Mark Group", "Lowest Mark Group", "Highest Gold Group", "Lowest Gold Group", "Highest Points Group", "Lowest Points Group", "Highest Mark Friend", "Lowest Mark Friend", "Highest Gold Friend", "Lowest Gold Friend", "Highest Points Friend", "Lowest Points Friend"],
				default: 'Self'
			},
			TargetValue: {
				type: Number,
				default: 1
			},
			ValueType: {
				type: String,
				enum: ['Any', 'Percentage', 'All', 'Previous'],
				default: 'Any'
			},
			KeywordValue: {
				type: Number,
				default: 1
			},
			ValueMultiple: {
				type: Number,
				default: 1,
			},
			ValueDivide: {
				type: Number,
				default: 1
			},
			Description: {
				type: String,
				default: ''
			}
		}],
		Approved: {
			type: Boolean,
			default: false
		}
	}, {
	  timestamps: true,
	  autoIndex: false
	}
);
var cardModelSchema = mongoose.model('Cards', cardSchema, 'Cards');

module.exports = {
	Cards: cardModelSchema
}