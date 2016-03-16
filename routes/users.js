var express = require('express');
var router = express.Router();
var mysql = require ('mysql');
var bodyParser = require('body-parser') //parses information from POST
var methodOverride = require('method-override'); //used to manipulate POST


var connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'weresquirrel',
  database : 'glowworm'
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
