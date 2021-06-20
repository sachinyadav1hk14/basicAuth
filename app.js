//jshint esversion:6

///////////////////////////////////////////modules////////////////////////////////////////////////

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

////////////////////////////////////////passport setup///////////////////////////////////////
app.use(session({
 secret: "this is a long string",
 resave: false,
 saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

////////////////////////////////////////////mongodb///////////////////////////////////////////

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

// collection format
const userSchema = new mongoose.Schema({
 email: String,
 password: String
});

userSchema.plugin(passportLocalMongoose);

//collection items/users
const User = new mongoose.model('User', userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//////////////////////////////////////////////routes//////////////////////////////////////////


app.get('/', function (req, res) {
 res.render('home');
});

app.get('/register', function (req, res) {
 res.render('register');
});

app.get('/secrets', function (req, res) {
 if (req.isAuthenticated()) {
  res.render('secrets');
 } else {
  res.redirect('/login');
 }
});

app.post('/register', function (req, res) {
 User.register({ username: req.body.username }, req.body.password, function (err, user) {
  if (err) {
   console.log(err);
   res.redirect('/register');
  } else {
   passport.authenticate('local')(req, res, function () {
    res.redirect('/secrets')
   })
  }
 })
});

app.get('/logout', function (req, res) {
 req.logOut();
 res.redirect('/');
});

app.get('/login', function (req, res) {
 res.render('login');
});

app.post('/login', function (req, res) {
 const user = new User({
  username: req.body.username,
  password: req.body.password
 });

 req.login(user, function (err) {
  if (err) {
   console.log(err);
  } else {
   passport.authenticate('local')(req, res, function () {
    res.redirect("/secrets");
   })
  }
 })

});

///////////////////////////////////////////////port setup////////////////////////////////////////////

const port = process.env.port || 3000;
app.listen(port, function () {
 console.log(`Server is running on ${port}`)
});