var map;

L.MandelbrotSet = L.TileLayer.Canvas.extend({
  tileSize: 256,
  initialize: function(options) {
    L.Util.setOptions(this, options);
    return this.drawTile = function(canvas, tilePoint) {
      var ctx;

      ctx = {
        canvas: canvas,
        tile: tilePoint
      };
      return this._draw(ctx);
    };
  },
  _data: function(ctx) {
    var ImDiff, ImStart, Im_factor, MaxIm, MaxIterations, MaxRe, MinIm, MinRe, ReDiff, ReStart, Re_factor, Z_im, Z_im2, Z_re, Z_re2, c_im, c_re, data, i, isInside, n, tileCount, x, y;

    tileCount = 1 << this._map._zoom;
    ReStart = -2.0;
    ReDiff = 3.0;
    MinRe = ReStart + ReDiff * ctx.tile.x / tileCount;
    MaxRe = MinRe + ReDiff / tileCount;
    ImStart = -1.2;
    ImDiff = 2.4;
    MinIm = ImStart + ImDiff * ctx.tile.y / tileCount;
    MaxIm = MinIm + ImDiff / tileCount;
    Re_factor = (MaxRe - MinRe) / (this.tileSize - 1);
    Im_factor = (MaxIm - MinIm) / (this.tileSize - 1);
    MaxIterations = 32;
    data = [];
    y = 0;
    i = 0;
    while (y < this.tileSize) {
      c_im = MinIm + y * Im_factor;
      x = 0;
      while (x < this.tileSize) {
        c_re = MinRe + x * Re_factor;
        Z_re = c_re;
        Z_im = c_im;
        isInside = true;
        n = 0;
        n = 0;
        while (n < MaxIterations) {
          Z_re2 = Z_re * Z_re;
          Z_im2 = Z_im * Z_im;
          if (Z_re2 + Z_im2 > 4) {
            isInside = false;
            break;
          }
          Z_im = 2 * Z_re * Z_im + c_im;
          Z_re = Z_re2 - Z_im2 + c_re;
          ++n;
        }
        if (isInside) {
          data[i++] = data[i++] = data[i++] = 0;
        } else if (n < MaxIterations / 2) {
          data[i++] = 255 / (MaxIterations / 2) * n;
          data[i++] = data[i++] = 0;
        } else {
          data[i++] = 255;
          data[i++] = data[i++] = (n - MaxIterations / 2) * 255 / (MaxIterations / 2);
        }
        data[i++] = 255;
        ++x;
      }
      ++y;
    }
    return data;
  },
  _draw: function(ctx) {
    var d, data, g, i, n;

    data = this._data(ctx);
    g = ctx.canvas.getContext("2d");
    d = g.createImageData(this.tileSize, this.tileSize);
    i = 0;
    n = this.tileSize * this.tileSize * 4;
    while (i < n) {
      d.data[i] = data[i];
      i++;
    }
    return g.putImageData(d, 0, 0);
  }
});

map = L.map("map");

map.addLayer(new L.MandelbrotSet());

map.setView(new L.LatLng(0, 0), 2);
