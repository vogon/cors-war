var w = null, h = null;

var coreMap;

function genCoreMap(core) {
  for (var x = 0; x < w; x++) {
    for (var y = 0; y < h; y++) {
      // var r = x, g = 0, b = y;
      var insn = core[y * w + x];

      // var r = Math.floor(Math.random() * 256), 
      //     g = Math.floor(Math.random() * 256),
      //     b = Math.floor(Math.random() * 256);

      // coreMap[x][y] = 'rgb(' + r + ',' + g + ',' + b + ')';

      if (insn.owner != null) {
        coreMap[x][y] = 'rgb(255, 0, 0)';
      } else {
        coreMap[x][y] = 'rgb(25, 25, 25)';
      }
    }
  }
}

function repaint() {
  var canvas = $('#canvas');
  var colW, rowH;

  // compute column width/row height
  colW = canvas.width() / w - 1;
  rowH = canvas.height() / h - 1;

  var ctx = canvas[0].getContext('2d');

  for (var x = 0; x < w; x++) {
    for (var y = 0; y < h; y++) {
      ctx.fillStyle = coreMap[x][y];
      ctx.fillRect(x * (colW + 1), y * (rowH + 1), colW, rowH);
    }
  }
}

function setup(width, height) {
  w = width;
  h = height;

  // calculate actual canvas width/height
  var canvas = $('#canvas')[0];
  var idealWidth = canvas.width;
  // round tile width down to nearest pixel
  var tileWidth = Math.floor(idealWidth / w);

  var actualWidth = tileWidth * w;
  // fix aspect ratio
  var actualHeight = tileWidth * h;

  // push computed dimensions back to canvas
  canvas.width = actualWidth;
  canvas.height = actualHeight;

  coreMap = new Array(w);

  for (var x = 0; x < w; x++) {
    var column = new Array(h);

    for (var y = 0; y < h; y++) {
      column[y] = 0;
    }

    coreMap[x] = column;
  }

  socket.on('sync', function (data) {
    genCoreMap(data.core);
    repaint();
  });
}

var socket = io.connect('http://localhost');
socket.on('start', function (data) {
  setup(data.width, data.height);
});