var bcrypt = require('bcrypt-nodejs');
var debug = require('debug')('modelbencrypt');
var SALT_WORK_FACTOR = 10;

module.exports = {
	ModelEncrypt: function (object, PropertyStringName, next) {
    
	    // only hash the password if it has been modified (or is new)
	    if (!object.isModified(PropertyStringName)) return next();

	    // generate a salt
	    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	        if (err) return next(err);

	        // hash the password using our new salt
	        bcrypt.hash(object.Password, salt, null, function(err, hash) {
	            if (err) {
	            	debug(err);
	        		return next(err);
	        	}

	            // override the cleartext password with the hashed one
	            object.Password = hash;
	            next();
	        });
	    });

	}
}



