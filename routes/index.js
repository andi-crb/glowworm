var express = require('express');
var router = express.Router();
var mysql = require ('mysql');

var connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'weresquirrel',
  database : 'glowworm'
})

// connection.query('SELECT * FROM employees',function(err,rows){
//   if(err) throw err;

//   console.log('Data received from Db:\n');
//   console.log(rows);
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('hi!')
  connection.query('SELECT * FROM stories', function(err, rows){
    console.log(res)
    res.render('index', {title: 'glowworm', stories : rows });
    console.log(rows)  
  });
})

module.exports = router;
