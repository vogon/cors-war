var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    minify = require('express-minify');

server.listen(80);

app.use(express.logger());
app.use(express.static(__dirname + "/public"));
app.use(minify());
app.use('/lib/bootstrap', express.static(require.resolve('bootstrap-browser')));
app.use('/lib/jquery', express.static(require.resolve('jquery-browser')));

io.sockets.on('connection', function (socket) {
  var intervalId = setInterval(function () {
    socket.emit('time', {});
  }, 500);

  socket.on('disconnect', function() {
    clearInterval(intervalId);
  });
});

