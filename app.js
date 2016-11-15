var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
 
var app = express();
 
var server = app.listen(process.env.PORT || 8001, function() {
  console.log('listening on *:', process.env.PORT || 8001);
});

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
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('scanevent', "<b>Connected</b>");
 
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
 
// Set Express routes.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});
 
app.post('/scanevent', function(req, res) {
  var message = req.body.message;
  io.emit('scanevent', message);
 
  console.log("Scanevent message -> ", message);
  res.send('Event received');
});


