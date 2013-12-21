var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    minify = require('express-minify');

var mars = require('./core/mars')
  , dwarf = require('./core/dwarf-test');
var warrior = require('./core/warrior');
var Opcode = warrior.Opcode, Modifier = warrior.Modifier, Mode = warrior.Mode;

var coreSize = 8192;

var initialInsn = warrior.Insn(Opcode.DAT, Modifier.F, Mode.Immediate, 0, 
  Mode.Immediate, 0);
var state = mars(coreSize, initialInsn, 64, 300, coreSize, coreSize);

var width, height;

// determine core map dimensions
for (var i = Math.floor(Math.sqrt(coreSize)); i > 0; i--) {
  if (coreSize % i == 0) {
    // i divides core size; use this as the height
    height = i;
    width = coreSize / i;
    break;
  }
}

console.log('core map dimensions: ' + width + 'x' + height);

if (width / height > 3) {
  console.log('canvas would be too short for its own good (' + width + 'x' + 
    height + ')');
  process.exit(1);
}

state.load(dwarf, 1);

server.listen(80);

app.use(express.logger());
app.use(express.static(__dirname + "/public"));
app.use(minify());
app.use('/lib/bootstrap', express.static(require.resolve('bootstrap-browser')));
app.use('/lib/jquery', express.static(require.resolve('jquery-browser')));

io.set('log level', 2);

var tsc = 0;

io.sockets.on('connection', function (socket) {
  socket.emit('start', { width: width, height: height });

  var intervalId = setInterval(function () {
    if (state.taskQueue.length > 1) {
      state.step();
      tsc += 1;

      if (tsc % 50 == 0) {
        socket.emit('sync', { core: state.core });
      }
    }
  }, 10);

  socket.on('disconnect', function() {
    clearInterval(intervalId);
  });
});

