var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'Express'
	});
});

router.route("/errorcheck")

.post(function(req, res, next) {
	var err = req.body.Error || 500;
	res.status(err).json({
		"err": "blargh"
	});
});


module.exports = router;