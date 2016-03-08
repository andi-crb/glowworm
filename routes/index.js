var express = require('express');
var router = express.Router();
var mysql = require ('mysql');
var bodyParser = require ('body-parser');
var moment = require ('moment');
var methodOverride = require('method-override');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'weresquirrel',
  database : 'glowworm'
})

//Any requests to this controller must pass through this 'use' function
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
    }))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {user: req.user});
})

//passportstuff

passport.serializeUser(function(user, done){
  console.log('user', user)
  done(null, user.idusers)
})

passport.deserializeUser(function(id, done){
  connection.query("select * from users where idusers = "+id, function(err, rows){
    done(err, rows[0])
  })
})

passport.use('local-signup', new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
},
function(req, email, password, done, displayname){
  // console.log(req, email)
  connection.query("select * from users where emailaddress = '" + req.body.email + "'",function(err, rows){
    console.log(rows);
    if(err)
      return done(err);
    if (rows.length){
      return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
    } else {
      var newUserMysql = new Object();
      newUserMysql.email = email;
      newUserMysql.password = password;
      newUserMysql.displayname = displayname
      var insertQuery = "INSERT INTO users (emailaddress, password, displayname) VALUES ('" + req.body.email +"','"+req.body.password+ "','" + req.body.displayname +"')";
      connection.query(insertQuery,function(err, rows){
        newUserMysql.idusers = rows.insertId;
        return done(null, newUserMysql)
      })
    }
  })
}
))

passport.use('local-login', new LocalStrategy({
  usernameField : 'emailaddress',
  passwordField : 'password',
  passReqToCallback : true 
},
function(req, email, password, done) { 
  connection.query("SELECT * FROM `users` WHERE `emailaddress` = '" + req.body.emailaddress + "'",function(err,rows){
    console.log(rows)
    if (err)
      return done(err);
    if (!rows.length) {
      return done(null, false, req.flash('loginMessage', 'No user found.')); 
    } 
    if (!( rows[0].password == req.body.password))
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage 
          return done(null, rows[0]);     

        });
}))


//Registration and Logins

router.get('/register/', function(req, res) {
  res.render('register', { });
});

router.post('/register', passport.authenticate('local-signup',{
  successRedirect : '/',
  failureRedirect : '/'

}));

router.get('/login', function(req, res) {
  res.render('login', { user : req.user });
});

router.post('/login',
  passport.authenticate('local-login'),
  function(req, res) {
    console.log(req.user)

    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/');
  })

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

/* GET stories page. */
router.get('/stories/', function(req, res, next) {
  console.log('stories')
  connection.query('SELECT * FROM stories', function(err, rows){
    res.render('stories', {title: 'glowworm', stories : rows, user: req.user});
  });
})

// GET individual story page

router.route('/stories/:id')
.get(function(req, res, next){
  var id = req.params.id
  if (id === 'random'){
    connection.query('SELECT idstories FROM stories ORDER BY rand() LIMIT 1', function(err, rows){
      var randomStoryId = rows[0].idstories
      res.redirect('/stories/'+randomStoryId)
    })
  } else {
      var now = moment().format("YYYY-MM-DD");
      console.log(now)
    connection.query('SELECT * FROM stories LEFT JOIN reviews ON stories.idstories = reviews.storiesid LEFT JOIN users ON reviews.usersid = users.idusers WHERE stories.idstories =' + id, function(err,rows){
      console.log(typeof rows[0])
      if (typeof rows[0] === 'undefined'){
        console.log(err, rows)
        res.render('error')
      } else {
      console.log(err, rows)
      res.render('showstory', {title:'glowworm', story : rows[0], reviews : rows, user: req.user, now:now})
      }
    })    
  }
})
.post(function(req, res, next){
  user = req.user.idusers
  connection.query('INSERT INTO reviews (storiesid, usersid, review, rating, status, dateread) VALUES ("' + req.body.storiesid + '","' + req.user.idusers  + '","' + req.body.review  + '","' + req.body.rating + '","' + req.body.status + '","' + req.body.dateread + '")', function(err, rows){
    res.redirect('/stories/'+req.body.storiesid)
  })
})

// GET individual story edit page, edit and delete stories

router.route('/stories/:id/edit')
.get(function(req, res, next){
  var id = req.params.id
  connection.query('SELECT * FROM stories WHERE idstories=' + id, function(err,rows){
    console.log(rows)
    res.render('editstory', {title:'glowworm', story : rows[0], user : req.user})
  })    
})
.put(function(req, res, next){
  connection.query('UPDATE stories SET title="' + req.body.title + '", author="' + req.body.author + '" ,url="' + req.body.url + '" ,publication="' + req.body.publication + '" WHERE idstories="' + req.body.idstories + '"', function(err, rows){
    res.redirect('/stories/'+req.body.idstories)
  })
})

//GET all reviews

router.route('/reviews')
.get(function(req, res, next){
  connection.query('SELECT * FROM reviews LEFT JOIN users ON users.idusers = reviews.usersid LEFT JOIN stories on reviews.storiesid = stories.idstories', function(err, rows){
    console.log(rows)
    res.render('reviews', {user:req.user, reviews: rows})
  })
})

//Edit individual reviews
router.route('/reviews/:id/edit')
.get(function(req, res, next){
  var id = req.params.id
  console.log(id)
  connection.query('SELECT * FROM reviews WHERE idreviews=' + id, function(err,rows){
    console.log(rows)
    res.render('editreview', {review : rows[0], user : req.user})
  })    
})
.put(function(req, res, next){
  connection.query('UPDATE reviews SET review="' + req.body.review + '", status="' + req.body.status + '" ,rating="' + req.body.rating + '" ,dateread="' + req.body.dateread + '" WHERE idreviews="' + req.body.idreviews + '"', function(err, rows){
    res.redirect('/reviews/'+req.body.idreviews)
  })
})
//Add a new story

router.route('/newstory')
.get(function(req, res){
  res.render('newstory', { user : req.user });
})
.post(function(req, res, next){
  connection.query('INSERT INTO stories (title, author, url, publication) VALUES("' + req.body.title + '","' + req.body.author + '","' + req.body.url + '","' + req.body.publication + '")', function(err, rows){
    res.redirect('/stories/')
  })
})

//User profile

router.route('/profile/:id')
.get(function(req, res, next){
  var id = req.params.id
  connection.query('SELECT * FROM users WHERE idusers=' + id, function(err,rows){
    res.render('profile', {profile : rows[0], user: req.user})
  })    
})

//Myprofile

router.route('/myprofile')
.get(function(req, res, next){
  res.redirect('profile/' + req.user.idusers) 
})

module.exports = router;
