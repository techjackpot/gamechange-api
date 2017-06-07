var mongoose = require('mongoose');
var method = Accessibility.prototype;

function Accessibility() {
    this._accesibilityArray = [
        this.getAccesibilityEnum().Public,
        this.getAccesibilityEnum().Private,
        this.getAccesibilityEnum().Friends
    ];
}

method.getAccesibilityEnum = function () {
    return {
        Public: 'PUBLIC',
        Private: 'PRIVATE',
        Friends: 'FRIENDS',
        All: 'ALL'
    }
};

method.getRelationObject = function () {
    return {
        Blocked: [],
        Public: [this.getAccesibilityEnum().Public],
        Friends: [this.getAccesibilityEnum().Friends, this.getAccesibilityEnum().Public],
        All: [this.getAccesibilityEnum().Public, this.getAccesibilityEnum().Private, this.getAccesibilityEnum().Friends]
    }
};

method.getAccesibilitySchema = function (defaultState, Static) {
    if (defaultState === undefined)
        defaultState = this.getAccesibilityEnum().Private;

    if (Static === undefined)
        Static = false;

    return new mongoose.Schema({
        Permission: {
            type: String,
            enum: this._accesibilityArray,
            default: defaultState
        },
        Static: {
            type: Boolean,
            default: Static
        }
    });
};

method.getDefaultSchema = function (defaultState, Static) {
    return {
            Static: Static,
            Permission: defaultState
        }
}

method.getAccessibility = function (obj) {
    if (obj.Accessibility !== undefined || obj.Accessibility !== null)
        return obj.Accessibility;
    else
        return undefined;
}

module.exports = Accessibility;