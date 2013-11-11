var w = 256, h = 256;

var core = function() {
  var arr = new Array(w);

  for (var x = 0; x < w; x++) {
    var column = new Array(h);

    for (var y = 0; y < h; y++) {
      column[y] = 0;
    }

    arr[x] = column;
  }

  return arr;
}();

function genColors() {
  for (var x = 0; x < w; x++) {
    for (var y = 0; y < h; y++) {
      // var r = x, g = 0, b = y;
      var r = Math.floor(Math.random() * 256), 
          g = Math.floor(Math.random() * 256),
          b = Math.floor(Math.random() * 256);

      core[x][y] = 'rgb(' + r + ',' + g + ',' + b + ')';
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
      ctx.fillStyle = core[x][y];
      ctx.fillRect(x * (colW + 1), y * (rowH + 1), colW, rowH);
    }
  }
}

var socket = io.connect('http://localhost');
socket.on('time', function (data) {
  genColors();
  repaint();
});