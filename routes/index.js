var express = require('express');
var router = express.Router();
var mysql = require ('mysql');

var connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'weresquirrel',
  database : 'glowworm'
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
})

/* GET stories page. */
router.get('/stories/', function(req, res, next) {
  console.log('stories')
  connection.query('SELECT * FROM stories', function(err, rows){
    res.render('stories', {title: 'glowworm', stories : rows });
  });
})

// GET individual story page

router.get('/stories/:id', function(req, res, next){
  var id = req.params.id
  if (id === 'random'){
    connection.query('SELECT idstories FROM stories ORDER BY rand() LIMIT 1', function(err, rows){
      var randomStoryId = rows[0].idstories
      res.redirect('/stories/'+randomStoryId)
    })
  } else {
    connection.query('SELECT * FROM stories WHERE idstories=' + id, function(err,rows){
      console.log(id)
      console.log(rows)
      res.render('showstory', {title:'glowworm', story : rows[0]})
    })    
  }
})

// GET individual story edit page, edit and delete stories

router.route('/stories/:id/edit')
  .get(function(req, res, next){
  var id = req.params.id
  connection.query('SELECT * FROM stories WHERE idstories=' + id, function(err,rows){
    console.log(rows)
    res.render('editstory', {title:'glowworm', story : rows[0]})
    })    
  })
  // .put(req, res, next)

module.exports = router;
