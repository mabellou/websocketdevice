var express = require('express'),
    app = express(),
    session = require('express-session');
var session_secret = process.env.SESSION_SECRET || "toomuchsecuretoken";
var user = process.env.USER1;
var password = process.env.PASSWORD1;
var bodyParser = require('body-parser');
var path = require('path');
 
var app = express();

var server = app.listen(process.env.PORT || 8002, function() {
  console.log('listening on *:', process.env.PORT || 8002);
});

app.use(session({
    secret: session_secret,
    resave: true,
    saveUninitialized: true
}));
var sharedsession = require("express-socket.io-session");

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  if (req.session && req.session.user === process.env.USER1 && req.session.admin)
    return next();
  else
    return res.sendStatus(401);
};

var io = require('socket.io')(server);
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/socket.io', express.static('socket.io'));
 
 app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
	return next();
});


// Set socket.io listeners.
io.on('connection', function(socket) {
  console.log('a user connected');
  socket.emit('scanevent', "<b>Connected</b>");
 
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Login endpoint
app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/login.css', function (req, res) {
  res.sendFile(path.join(__dirname + '/login.css'));
});

// Login endpoint
app.post('/login', function (req, res) {
  if (!req.body.username || !req.body.password) {
    res.send('login failed');    
  } else if(req.body.username === process.env.USER1 || req.body.password === process.env.PASSWORD1) {
    req.session.user = process.env.USER1;
    req.session.admin = true;
    res.redirect('page');
  } else {
    res.send('login failed');   
  }
});

// Logout endpoint
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.send("logout success!");
});

// Set Express routes.
app.get('/', (req, res) => {
  res.redirect('login'); 
});

// Set Express routes.
app.get('/page', auth, (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});
 
app.post('/scanevent', function(req, res) {
  var message = req.body.message;
  io.emit('scanevent', message);
 
  console.log("Scanevent message -> ", message);
  res.send('Event received');
});


