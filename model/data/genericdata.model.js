var mongoose = require("mongoose");

var schema = new mongoose.Schema({
    DataType: {
        type: String,
        index: true
    },
    Data: mongoose.Schema.Types.Mixed,
}, {
        timestamps: true
    });

module.exports = {
    GenericData: schema,
}